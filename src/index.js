import React, { useEffect, useState } from 'react';
import {createRoot} from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
    Route,
    Link,
    Navigate,
    redirect,
} from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    const [defaultContent, showDefaultContent] = useState(true);
    const [content, setContent] = useState("");

    useEffect(() => {
        console.log("use effect and state");
        return () => {}
    }, [content]);

    const handleDisplayContent = (e) => {
        let value = e.target.dataset.bsToggle;
        if (value) {
            let url = "https://raw.githubusercontent.com/endepointe/site/refs/heads/main/writeups/huntress2024/knightsquest/knightsquest.md";
            fetch(url).then((response) => {
                if (!response.ok) {
                    console.error("issue fetching writeup");
                }
                return response.text();
            })
            .then((data) => {
                console.log(data.length);
                setContent(data);
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    return (
        <div className="container my-4">
            <button className="btn btn-primary d-md-none" type="button" data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasResponsive" aria-controls="offcanvasResponsive">
                    \\\\\
                </button>
            <div className="row">
                <nav className="offcanvas-md offcanvas-start col-12 col-md-3 sidebar left border-end">
                    <h5>Huntress 2024</h5>
                    <ul>
                        <li className="nav-link active" id="nav-knightsquest-tab" type="button"
                            onClick={(e) => handleDisplayContent(e)} data-bs-toggle="knightsquest" data-bs-target="knightsquest" 
                            aria-controls="nav-knightsquest" aria-selected="true">Knights Quest</li>
                    </ul>

                    <li className="nav-link" id="nav-profile-tab" type="button" 
                        data-bs-toggle="tab" data-bs-target="#nav-profile" 
                        role="tab" aria-controls="nav-home" aria-selected="false">profile</li>
                    <li className="nav-link" id="nav-contact-tab" type="button" 
                        data-bs-toggle="tab" data-bs-target="#nav-contact" 
                        role="tab" aria-controls="nav-contact" aria-selected="false">contact</li>
                </nav>

                <div className="offcanvas-body px-4 col-12 col-md-6 content tab-content" id="offcanvasResponsive" 
                    aria-labelledby="offcanvasResponsiveLabel">
                    <div id="nav-tabContent">
                        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                    </div>
                </div>

                <div className="col-12 col-md-3 sidebar right">
                    sidebar right
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
