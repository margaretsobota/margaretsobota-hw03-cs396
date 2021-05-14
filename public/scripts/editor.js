const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const getDoctors = async () => {
  try {
    const response = await fetch('http://localhost:8081/doctors',  {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        data.forEach(doctor => {
          document.querySelector("#doctors-section").innerHTML += `
            <li>
              <button class="doctor-button" id=${doctor._id} onclick="handleDoctorSelect(event)">
                ${doctor.name}
              </button>
            </li>
          `;
        });
    } else {
        console.log('Bad request');
    };
  } catch(err) {
    console.log(err);
  }
}

const getDoctor = async (id) => {
  try {
    const response = await fetch(`http://localhost:8081/doctors/${id}`,  {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        document.querySelector("#doctor").innerHTML = `
        <div id="doctor-detail-heading" >
          <h1>
            ${data.name}
          </h1>
          <button class="btn" id="edit"> Edit </button>
        </div>
        <h3>
          Seasons: ${data.seasons}
        </h3>
        <img src=${data.image_url} />
        `;
    } else {
        console.log('Bad request');
    };
  } catch(err) {
    console.log(err);
  }
}

const getDoctorCompanions = async (id) => {
  try {
    const response = await fetch(`http://localhost:8081/doctors/${id}/companions`,  {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        document.querySelector("#companions-list").innerHTML = "";
        data.forEach((companion) => {
          document.querySelector("#companions-list").innerHTML += `
          <li class="companion-el">
            <img class="companion-img" src=${companion.image_url} />
            <h3>
              ${companion.name}
            </h3>
          </li>
          `;
        });

    } else {
        console.log('Bad request');
    };
  } catch(err) {
    console.log(err);
  }
}

const createDoctor = async (body) => {
  try {
    const response = await fetch(`http://localhost:8081/doctors`,  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        document.querySelector("#error-message").style.display = "none";
        const data = await response.json();
        document.querySelector("#doctor").innerHTML = `
        <h1>
          ${data.name}
        </h1>
        <h3>
          Seasons: ${data.seasons}
        </h3>
        <img src=${data.image_url} />
        `;
        document.querySelector("#doctors-section").innerHTML += `
          <li>
            <button class="doctor-button" id=${data._id} onclick="handleDoctorSelect(event)">
              ${data.name}
            </button>
          </li>
        `;

    } else {
        document.querySelector("#error-message").style.display = "block";
        console.log('Bad request', response);
    };
  } catch(err) {
    console.log(err);
  }
}

const handleDoctorSelect = (ev) => {
  const id = ev.target.id;
  getDoctor(id);
  getDoctorCompanions(id);
}

document.querySelector("#create-doctor-button").onclick = () => {
  document.querySelector("#doctor-form").style.display = "block";
}

document.querySelector("#cancel").onclick = () => {
  document.querySelector("#doctor-form").style.display = "none";
}

document.querySelector("#create").onclick = () => {
  const name = document.querySelector("#name").value;
  const seasons = document.querySelector("#seasons").value.split(",");
  const ordering = document.querySelector("#ordering").value;
  const image_url = document.querySelector("#image_url").value;
  const data = {
    name,
    seasons,
    ordering,
    image_url
  };
  createDoctor(data);
}

getDoctors();


// invoke this function when the page loads:
initResetButton();
