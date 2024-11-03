import React from 'react';
import {createRoot} from 'react-dom/client';

function Contact() 
{
    return <div><a href="google.com">ggoogle</a><h1>React Contact</h1></div>;
}

const domNode = document.getElementById('contact');

if (domNode) {
    const root = createRoot(domNode);
    root.render(<Contact />);
} else {
    console.error("there is an issue creating reactdom");
}
