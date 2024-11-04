import React from 'react';
import {createRoot} from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
    Route,
    Link,
    Navigate,
    redirect,
} from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <div>
                <Link to="/writeups">Writeups</Link>
            </div>),
    },
    {
        path: "/writeups",
        element: <div>Writeups</div>,
    },
    {
        path: '/writeups/',
        element: <Navigate to="/writeups" replace />,
    },
]);

function Contact() 
{
    return <div><a href="google.com">ggoogle</a><h1>React Contact</h1></div>;
}

const rootNode = document.getElementById('root');

if (rootNode) {
    const root = createRoot(rootNode);
    root.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
} else {
    console.error("there is an issue creating root node");
}
