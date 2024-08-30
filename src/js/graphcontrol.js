import Graph from "graphology";
import Sigma from "sigma";

const graph = new Graph();
const behavior_names = ["Recon", "Weaponization", "Delivery", "Exploitation", "Installation", "Command and Control", "Actions on Objectives"];


let i = 0;
for (const name of behavior_names) 
{
    graph.addNode(i, 
        {
            label: name, 
            x: i, 
            y: (i % 2 ? 0: 1), 
            size: 20, color: "blue"
        });
    i++;
}
i = 0;
while (i !== behavior_names.length - 1)
{
    graph.addEdge(i.toString(), (i+1).toString(), { size: 1, color: "purple" });
    i++;
}

console.log(graph);
const container = document.getElementById("graph-container");
const sigmaInstance = new Sigma(graph, container);
console.log(sigmaInstance);
