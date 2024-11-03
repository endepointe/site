import {createRoot} from 'react-dom/client';
function Notes()
{
    return <div>Notes from react</div>;
}
const root = createRoot(document.getElementById('notes'));
root.render(<Notes />);
