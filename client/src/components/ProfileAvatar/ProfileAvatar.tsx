import placeholderPicture from "@/assets/profile-placeholder.png";

type ProfileAvatarProps = {
  src: string | null;
  alt: string;
  className: string;
};

const getImageSource = (value: string | null) => {
  const image = value?.trim();
  return image && image.toLowerCase() !== "null" && image.toLowerCase() !== "undefined"
    ? image
    : placeholderPicture;
};

export default function ProfileAvatar({ src, alt, className }: ProfileAvatarProps) {
  return (
    <img
      src={getImageSource(src)}
      alt={alt}
      className={className}
      onError={(event) => {
        if (event.currentTarget.src !== new URL(placeholderPicture, document.baseURI).href) {
          event.currentTarget.src = placeholderPicture;
        }
      }}
    />
  );
}
