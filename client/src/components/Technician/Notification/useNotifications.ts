import {
    buildApiUrl,
    buildWebSocketUrl,
    getFreshAccessToken,
    privateFetch,
} from "@/lib/api";
import type { Notification } from "@/types/notification";
import { mapNotification, sortNotificationsByNewest } from "@/utils/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

type InitialNotificationsMessage = {
    event: "initial_notifications";
    notification: unknown[];
    next?: string | null;
};

type NotificationCreatedMessage = {
    event: "notification_created";
    notification: unknown;
};

type NotificationArchivedMessage = {
    event: "notification_archived";
    notification: number;
};

type NotificationWebSocketMessage =
    | InitialNotificationsMessage
    | NotificationCreatedMessage
    | NotificationArchivedMessage;

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

const NOTIFICATIONS_READY_QUERY_KEY = ["notifications-ready"] as const;
const NOTIFICATIONS_WS_ENDPOINT = "/ws/notifications/user/";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isNotificationWebSocketMessage = (
    value: unknown
): value is NotificationWebSocketMessage => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_notifications") {
        return Array.isArray(value.notification);
    }

    if (value.event === "notification_archived") {
        return typeof value.notification === "number";
    }

    return value.event === "notification_created" && isRecord(value.notification);
};

const upsertNotification = (
    notifications: Notification[],
    nextNotification: Notification
) => {
    const exists = notifications.some(
        (notification) => notification.id === nextNotification.id
    );

    if (!exists) {
        return sortNotificationsByNewest([nextNotification, ...notifications]);
    }

    return sortNotificationsByNewest(
        notifications.map((notification) =>
            notification.id === nextNotification.id ? nextNotification : notification
        )
    );
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    const setNotificationAsRead = (notificationId: number) => {
        queryClient.setQueryData<Notification[]>(
            NOTIFICATIONS_QUERY_KEY,
            (currentNotifications = []) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, status: "read" }
                        : notification
                )
        );
    };

    return useMutation({
        mutationFn: async (notificationId: number) => {
            const response = await privateFetch(
                buildApiUrl(`/api/notifications/${notificationId}/`),
                {
                    method: "PATCH",
                    body: JSON.stringify({ status: "read" }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update notification status");
            }
        },
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

            const previousNotifications =
                queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY);

            setNotificationAsRead(notificationId);

            return { previousNotifications };
        },
        onSuccess: (_data, notificationId) => {
            setNotificationAsRead(notificationId);
        },
        onError: (_error, _notificationId, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    NOTIFICATIONS_QUERY_KEY,
                    context.previousNotifications
                );
            }
        },
    });
};

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const notificationSocketRef = useRef<WebSocket | null>(null);
    const cachedNotificationsAreReady =
        queryClient.getQueryData<boolean>(NOTIFICATIONS_READY_QUERY_KEY) === true;
    const [hasInitialNotifications, setHasInitialNotifications] = useState(
        cachedNotificationsAreReady
    );

    const {
        data: notifications = [],
        isPending,
        isError,
    } = useQuery<Notification[]>({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY) ?? [],
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            const accessToken = await getFreshAccessToken();

            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(NOTIFICATIONS_WS_ENDPOINT, { token: accessToken })
            );

            notificationSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isNotificationWebSocketMessage(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_notifications") {
                    setHasInitialNotifications(true);
                    queryClient.setQueryData(NOTIFICATIONS_READY_QUERY_KEY, true);
                    queryClient.setQueryData<Notification[]>(
                        NOTIFICATIONS_QUERY_KEY,
                        sortNotificationsByNewest(
                            parsedMessage.notification.map(mapNotification)
                        )
                    );
                    return;
                }

                if (parsedMessage.event === "notification_archived") {
                    queryClient.setQueryData<Notification[]>(
                        NOTIFICATIONS_QUERY_KEY,
                        (currentNotifications = []) =>
                            currentNotifications.filter(
                                (notification) =>
                                    notification.id !== parsedMessage.notification
                            )
                    );
                    return;
                }

                queryClient.setQueryData<Notification[]>(
                    NOTIFICATIONS_QUERY_KEY,
                    (currentNotifications = []) =>
                        upsertNotification(
                            currentNotifications,
                            mapNotification(parsedMessage.notification)
                        )
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (notificationSocketRef.current === socket) {
                notificationSocketRef.current = null;
            }
        };
    }, [queryClient]);

    return {
        notifications,
        isLoading: isPending || !hasInitialNotifications,
        isError,
    };
};
