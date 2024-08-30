import {gsap} from 'gsap';
import { PixiPlugin } from "gsap/PixiPlugin.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";
gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

const map = document.getElementById("world-map")
                    .shadowRoot.getElementById("svgmap");

console.log("loaded map!!", map);

const SVG_WIDTH = 3000;
const SVG_HEIGHT = 1286;
const path = map.getElementsByTagName("path");

const pulse_inner = map.getElementById("inner");
const pulse_outer = map.getElementById("outer");
const loc = map.querySelectorAll(".loc");

window.onload = (e) => {
    // original dimensions 2000 x 857
    // loc[0] is start
    let curr = {
        x: loc[0].getAttribute("x"),
        y: loc[0].getAttribute("y")
    }
    let vb = [curr.x,curr.y,"1500","643"].join(" ");
    setViewBox(map, vb);
}

map.addEventListener("click", updatePulseLocation);

// input: borderbox coord object
// output: moves the viewbox location
function moveTo(next,e) {
    let mvb = getViewBox(map);
    // fkn js string int addition
    function move() {
        let vb = ""+(next.x)+" "+(next.y)+" "+(mvb[2])+" "+(mvb[3])+"";
        gsap.to(map, {
            attr: {viewBox: vb},
            ease: "circ.out",
            duration: 1.25,
        });
    }
    setTimeout(move, 0);
}

// input: an svg elem and vb String 
// output: elem viewBox mutation
function 
setViewBox(elem, vb) {
    elem.setAttribute("viewBox",vb);
}

// input: svg
// output: viewbox array of String
function
getViewBox(elem) {
    return elem.getAttribute("viewBox").split(" ").map(Number);
}

// input: Pointer event
// output: svg pulse location mutation
function 
updatePulseLocation(e) {
    let mvb = getViewBox(map);
    let mapBound = map.getBoundingClientRect();
    let boxBound = map.getBBox();
    // ((mouse - bound) / viewbox ratio) + topleft coord
    let x = ((e.clientX - mapBound.left) / (SVG_WIDTH / mvb[2])) + mvb[0];
    let y = ((e.clientY - mapBound.top) / (SVG_HEIGHT / mvb[3])) + mvb[1];
    pulse_inner.setAttribute("cx", (x));
    pulse_inner.setAttribute("cy", (y));
    pulse_inner.setAttribute("class", "z-0");
    pulse_outer.setAttribute("cx", (x));
    pulse_outer.setAttribute("cy", (y));
    pulse_outer.setAttribute("class", "z-0");
}

// input: Country list and index 
// output: outline the country after click/tap event
function 
outlineCountry(list, idx) {
    // todo
    //console.log(list.item(idx));
}

for (let i = 0; i < path.length; i++) {
    path.item(i).addEventListener("click", outlineCountry(path,i));
}

// todo: use this for zoom in/out
function 
updateMapDimensions(e) {
    //map.setAttribute("width",window.innerWidth);
    //map.setAttribute("height",window.innerHeight);
    console.log("r1: ",r1.getBoundingClientRect());
    console.log("map: ",map.getBoundingClientRect());
}

export { moveTo, map, loc } 
