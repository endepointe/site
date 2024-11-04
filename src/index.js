import React from 'react';
import {createRoot} from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
    Route,
    Link,
    Navigate,
    redirect,
} from 'react-router-dom';

function Navigation() 
{
    return (
        <nav className="container text-center">
            <ul className="nav nav-tabs" id="navTabs" role="tablist">
                <li className="nav-item" role="presentation">
                    <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/writeups">Writeups</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/other">Other</Link>
                </li>
            </ul>
        </nav>
    );
}

function Writeups()
{
    return (
        <div className="d-flex flex-row">
            <nav className="nav flex-column">
                <li className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Home</li>
                <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</button>
                <button className="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
                <button className="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled" type="button" role="tab" aria-controls="nav-disabled" aria-selected="false" disabled>Disabled</button>
            </nav>
            <div className="tab-content" id="nav-tabContent">
                <div className="tab-pane fade show active" 
                    id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
                    nav home
                </div>
                <div className="tab-pane fade" 
                    id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
                    nav profile
                </div>
                <div className="tab-pane fade" 
                    id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabindex="0">
                    nav contact
                </div>
            </div>
        </div>
    );    
}

const router = createHashRouter([
    {
        path: "/",
        element: (
            <div className="">
                <Navigation />
                <h1>Home</h1>
            </div>
        ),
    },
    {
        path: "/writeups",
        element: (
            <div className="">
                <Navigation />
                <Writeups />
            </div>),
    },
    {
        path: '/writeups/:name',
        loader: ({ params }) => {
            alert(params.name);
        },
        action:({ params }) => {},
        element: (
            <div>
                <Navigation />
                <h1>Writeups</h1>
            </div>
        ),
        errorElement: (
            <div className="">
                <Navigation />
                <h1>Home</h1>
            </div>
        )
    },
    {
        path: "/other",
        element: (
            <div className="">
                <Navigation />
                <h1>other</h1>
            </div>),
    },
]);


const rootNode = document.getElementById('root');

if (rootNode) {
    const root = createRoot(rootNode);
    root.render(
            <RouterProvider router={router} />
    );
} else {
    console.error("there is an issue creating root node");
}
