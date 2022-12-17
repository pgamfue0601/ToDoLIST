/**
 * author: Pablo Gámiz Fuentes
 */

const d = document,
    $table = d.querySelector(".crud-table"),
    $template = d.querySelector(".crud-template").content,
    $fragment = d.createDocumentFragment();


const $botontarea = document.querySelector("#crear-tarea");
const $grafica = document.querySelector("#grafica");

let chivato = false;
const jsapi = "http://localhost:3500/tareas/";
const $contador1 = document.querySelector(".contador-activa"),
$contador2 = document.querySelector(".contador-finalizado"),
$contador3 = document.querySelector(".contador-eliminado");

const estados = ["Tareas Activas", "Tareas Finalizadas", "Tareas Eliminadas"];
const contadorGraph = [];

$botontarea.addEventListener("click", () => {
    const $form = document.querySelector("#formu");
    if (!chivato) {
        $form.setAttribute("class", "d-inline");
        chivato = true;
    } else {
        $form.setAttribute("class", "d-none");
        chivato = false;
    }
})

const $botonenviar = document.querySelector("#enviar-tarea");

$botonenviar.addEventListener("click", async () => {

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let fechaActual = `${day}/${month}/${year}`;

    const $nombreTarea = document.querySelector("#nombre");
    const $fechaFin = document.querySelector("#fecha-fin");


    const date2 = new Date($fechaFin.value);

    let day2 = date2.getDate();
    let month2 = date2.getMonth() + 1;
    let year2 = date2.getFullYear();

    let fechaFin = `${day2}/${month2}/${year2}`;

    let nuevaTarea = {
        tarea: $nombreTarea.value,
        fechaInicio: fechaActual,
        fechaFinish: fechaFin,
        status: 0
    }

    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(nuevaTarea),
        };

        const enlace = await fetch(jsapi, options),
            json = await enlace.json();

        if (enlace.ok) {
            console.log("Se ha añadido una nueva tarea");
        } else throw {
            status: enlace.status,
            statusText: enlace.statusText
        };
    } catch (error) {
        console.log(error.statusText)
    }

})

const getJSON = async () => {
    try {
        const enlace = await fetch(jsapi);
        const json = await enlace.json();
        if (!enlace.ok) throw {
            status: enlace.status,
            message: enlace.statusText
        };
        json.forEach(datos => {
            $template.querySelector(".tarea-nombre").textContent = datos.tarea;
            $template.querySelector(".tarea-inicio").textContent = datos.fechaInicio;
            $template.querySelector(".tarea-fin").textContent = datos.fechaFinish;

            $template.querySelector(".finish").dataset.id = datos.id;
            $template.querySelector(".finish").dataset.tarea = datos.tarea;
            $template.querySelector(".finish").dataset.fechaInicio = datos.fechaInicio;
            $template.querySelector(".finish").dataset.fechaFinish = datos.fechaFinish;

            $template.querySelector(".delete").dataset.id = datos.id;
            $template.querySelector(".delete").dataset.tarea = datos.tarea;
            $template.querySelector(".delete").dataset.fechaInicio = datos.fechaInicio;
            $template.querySelector(".delete").dataset.fechaFinish = datos.fechaFinish;
            if (datos.status == 1) {
            $template.querySelector("tr").setAttribute("class", "finalizado tarea");
            $template.querySelector(".tarea-nombre").style.color = "blue";
            $template.querySelector(".tarea-inicio").style.color = "blue";
            $template.querySelector(".tarea-fin").style.color = "blue";
            $template.querySelector(".tarea-nombre").textContent = datos.tarea+" (FINALIZADO)";
            }else{
                $template.querySelector("tr").setAttribute("class", "activo tarea");
            $template.querySelector(".tarea-nombre").style.color = "black";
            $template.querySelector(".tarea-inicio").style.color = "black";
            $template.querySelector(".tarea-fin").style.color = "black";
            }

            let $clonado = d.importNode($template, true);
            $fragment.appendChild($clonado);

            
        })
        $table.querySelector("tbody").appendChild($fragment);
        $contador1.textContent = "Contador Activos: "+document.querySelectorAll(".activo").length;
        $contador2.textContent = "Contador Finalizados: "+document.querySelectorAll(".finalizado").length;
        $contador3.textContent = "Contador Eliminados: "+localStorage.length;
        
        contadorGraph.push(document.querySelectorAll(".activo").length);
        contadorGraph.push(document.querySelectorAll(".finalizado").length);
        contadorGraph.push(localStorage.length);

        const datosTareas = {
            label: "Cantidad de Tareas",
            data: contadorGraph,
            backgroundColor: 'rgba(255, 99, 71, 0.5)',
            borderColor: 'rgb(255, 99, 71)',
            borderWidth: 1,
        };
        
        new Chart($grafica, {
            type: 'bar',
            data: {
                labels: estados,
                datasets: [
                    datosTareas,
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        }
                    }],
                },
            }
        });

    } catch (error) {
        const miError = error.statusText || "Error al cargar los datos";
        console.log(miError);
    }
}

d.addEventListener('DOMContentLoaded', getJSON);

d.addEventListener('click', async (event) => {
    if (event.target.matches(".delete")) {
        event.preventDefault();

        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                }
            };

            const url = jsapi + event.target.dataset.id;
            
            const tareaEliminada = {
                fechaInicio: event.target.dataset.fechaInicio,
                fechaFinish: event.target.dataset.fechaFinish
            }
            localStorage.setItem(event.target.dataset.tarea, JSON.stringify(tareaEliminada));
            const enlace = await fetch(url, options);
            const json = await enlace.json();

            if( !enlace.ok) throw { status: enlace.status, message: enlace.statusText};
            location.reload();

        } catch (error) {
            const miError = error.statusText || "Error al cargar los datos";
            console.log(miError);
        }
    }
    else if(event.target.matches(".finish")){
        event.preventDefault();

        try{
            const options = {
                method : "PUT",
                headers : {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({
                    tarea: event.target.dataset.tarea,
                    fechaInicio: event.target.dataset.fechaInicio,
                    fechaFinish: event.target.dataset.fechaFinish,
                    status: 1
                }),
            };
            const url = jsapi + event.target.dataset.id;
            const enlace = await fetch(url, options);
            const json = await enlace.json();

            if( !enlace.ok) throw { status: enlace.status, message: enlace.statusText};
            location.reload();
        }catch (error){
            const miError = error.statusText || "Error al cargar los datos";
            console.log(miError);
        }
    }
})


document.addEventListener("keyup", (e) =>{
    if(e.target.matches("#buscador")){
        document.querySelectorAll(".tarea").forEach(tarea =>{
            tarea.textContent.toLowerCase().includes(e.target.value.toLowerCase())
            ? tarea.classList.remove("d-none")
            : tarea.classList.add("d-none")
        })
    }
})



