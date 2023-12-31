import {error} from '@sveltejs/kit';
import type {PageLoad} from './$types';

export const load: PageLoad = ({params}) => {
    return {
        title: "EP",
        content: "building systems",
    };
    error(404,"Not found.");
};
