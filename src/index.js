import * as bootstrap from 'bootstrap';
import React, { useEffect, useState } from 'react';
import {createRoot} from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
    Route,
    Link,
    Navigate,
    redirect,
    useParams,
} from 'react-router-dom';
import Markdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism';

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
            </ul>
        </nav>
    );
}


function Writeups()
{
    const {dir,filename} = useParams();
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("https://raw.githubusercontent.com/endepointe/site/refs/heads/main/writeups/");
    const [base, setBase] = useState("https://raw.githubusercontent.com/endepointe/site/main/writeups/");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (dir && filename) {
            console.log(dir,filename);
            let u = url + `${dir}/${filename}/${filename}.md`;
            let b = base + `${dir}/${filename}/`; // i know, this needs better content management but works.

            fetch(u).then((response) => {
                if (!response.ok) {

                    console.error("issue fetching writeup");
                }
                return response.text();
            })
            .then((data) => {
                console.log(data.length);
                let updatedContent = data.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
                    if (!src.startsWith('http')) {
                        return `![${alt}](${b}${src})`;
                    }
                    return match;
                });
                setContent(updatedContent);
            })
            .catch((error) => {
                console.error(error);
            });
        }
        return () => {}
    }, [dir,filename,content]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    const handleDisplayContent = (e) => {
        handleItemClick();
        let dir = e.target.dataset.writeupDir;
        let filename = e.target.dataset.writeupName;
        if (dir && filename) {
            let u = url + `${dir}/${filename}.md`;
            let b = base + `${dir}/`;

            fetch(u).then((response) => {
                if (!response.ok) {
                    console.error("issue fetching writeup");
                }
                return response.text();
            })
            .then((data) => {
                let updatedContent = data.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
                    if (!src.startsWith('http')) {
                        return `![${alt}](${b}${src})`;
                    }
                    return match;
                });
                setContent(updatedContent);
                window.location.hash = '#/writeups/' + `${dir}`;
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    return (
        <div className="container my-4 pb-8">
            <button className="btn btn-primary d-md-none my-3" onClick={toggleSidebar}>
                \\\
            </button>
            <div className="row">
                <nav className={`col-md-3 p-3 ${isOpen ? '' : 'd-none d-md-block'}`}>
                    <div>
                        <h5>Huntress 2024</h5>
                        <ul>
                            <li className="nav-link active" id="nav-knightsquest-tab" type="button" role="button"
                                onClick={(e) => handleDisplayContent(e)} onTouchStart={(e) => handleDisplayContent(e)}
                                data-writeup-dir="huntress2024/knightsquest" data-writeup-name="knightsquest" 
                                aria-controls="nav-knightsquest" aria-selected="true">Knights Quest</li>
                            <li className="nav-link active" id="nav-gocrackme2-tab" type="button" role="button"
                                onClick={(e) => handleDisplayContent(e)} onTouchStart={(e) => handleDisplayContent(e)} 
                                data-writeup-dir="huntress2024/gocrackme2" data-writeup-name="gocrackme2" 
                                aria-controls="nav-gocrackme2" aria-selected="true">GoCrackMe2</li>
                        </ul>
                    </div>
                </nav>

                <div className="px-4 col-12 col-md-9">
                    <div id="nav-tabContent" className="py-4">
                        <Markdown
                            children={content}
                            components={{
                                img: ({ node, ...props }) => (
                                    <img
                                        {...props}
                                        alt={node.alt || ""}
                                        style={{
                                            overflowY: 'auto',
                                            maxWidth: "100%",
                                            height: "auto",
                                            maxHeight: "600px"
                                        }}
                                    />
                                ),
                                code: ({ node, inline, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            {...props}
                                            language={match[1]}
                                            style={dark}
                                            PreTag="div"
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        />
                    </div>
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
                <h1>Home (in-progress)</h1>
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
        path: '/writeups/:dir/:filename',
        element: (
            <div>
                <Navigation />
                <Writeups />
            </div>
        ),
        errorElement: (
            <div className="">
                <Navigation />
            </div>
        )
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
