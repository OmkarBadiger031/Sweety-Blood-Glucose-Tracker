import { useEffect, useState } from "react";
import API from "./api";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
    const [isLogin, setIsLogin] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(
        Boolean(localStorage.getItem("token"))
    );

    const [loggedInUser, setLoggedInUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    // Automatically clear messages after 5 seconds
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 5000);

        return () => clearTimeout(timer);
    }, [message]);

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: ""
        });
    };

    // Handle input changes
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Handle login and registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");
        setLoading(true);

        try {
            if (isLogin) {
                const response = await API.post("/auth/login", {
                    email: formData.email.trim(),
                    password: formData.password
                });

                if (!response.data.token) {
                    throw new Error("Login token was not received.");
                }

                localStorage.setItem("token", response.data.token);

                if (response.data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(response.data.user)
                    );

                    setLoggedInUser(response.data.user);
                }

                resetForm();
                setIsAuthenticated(true);

            } else {
                await API.post("/auth/register", {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                });

                setMessage("Registration successful! Please log in.");
                setMessageType("success");

                setIsLogin(true);
                resetForm();
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Something went wrong. Please try again."
            );

            setMessageType("error");

        } finally {
            setLoading(false);
        }
    };

    // Logout and clear previous user details
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setLoggedInUser(null);
        setIsAuthenticated(false);
        setIsLogin(true);

        resetForm();

        setMessage("");
        setMessageType("");
    };

    // Show dashboard when authenticated
    if (isAuthenticated) {
        return (
            <Dashboard
                onLogout={handleLogout}
                user={loggedInUser}
            />
        );
    }

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Sweety</h1>

                <p className="subtitle">
                    Your Blood Glucose Tracker
                </p>

                <h2>
                    {isLogin ? "Welcome Back!" : "Create Account"}
                </h2>

                <form
                    key={isLogin ? "login" : "register"}
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >
                    {!isLogin && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                                ? "Login"
                                : "Register"}
                    </button>

                </form>

                {message && (
                    <p className={`message ${messageType}`}>
                        {message}
                    </p>
                )}

                <p className="toggle-text">

                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <span
                        onClick={() => {
                            if (loading) return;

                            setIsLogin(!isLogin);
                            setMessage("");
                            setMessageType("");
                            resetForm();
                        }}
                    >
                        {isLogin ? " Register" : " Login"}
                    </span>

                </p>

            </div>

        </div>
    );
}

export default App;