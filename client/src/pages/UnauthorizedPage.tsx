import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
    return (
        <main>
            <h1>Unauthorized</h1>
            <p>Your account does not have permission to view this page.</p>
            <Link to="/manage-ticket">Return to manage tickets</Link>
        </main>
    );
}
