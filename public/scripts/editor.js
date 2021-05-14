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

var selectedDoctor = "";

const getDoctors = async () => {
  try {
    const response = await fetch('http://localhost:8081/doctors',  {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        document.querySelector("#doctors-section").innerHTML = "";
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
        renderDoctor(data);
    } else {
        console.log('Bad request');
    };
  } catch(err) {
    console.log(err);
  }
}

const deleteDoctor = async (id) => {
  try {
    const response = await fetch(`http://localhost:8081/doctors/${id}`,  {
        method: 'DELETE'
    });
    if (response.ok) {
        console.log("deleted");
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
        renderDoctor(data);
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


const patchDoctor = async (id, body) => {
  try {
    const response = await fetch(`http://localhost:8081/doctors/${id}`,  {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        document.querySelector("#error-message").style.display = "none";
        const data = await response.json();
        renderDoctor(data);
        getDoctors();

    } else {
        document.querySelector("#error-message").style.display = "block";
        console.log('Bad request', response);
    };
  } catch(err) {
    console.log(err);
  }
}

const renderDoctor = (data) => {
  document.querySelector("#doctor").innerHTML = `
    <div id="doctor-detail-heading" >
      <h1>
        ${data.name}
      </h1>
      <div>
        <button class="btn" id="edit" onclick="handleEdit(event)">
          Edit
        </button>
        <button class="btn" id="delete" onclick="handleDelete(event)">
          Delete
        </button>
      </div>
    </div>
    <h3>
      Seasons: ${data.seasons}
    </h3>
    <img src=${data.image_url} />
  `;
  selectedDoctor = data;
}

const handleDoctorSelect = (ev) => {
  const id = ev.target.id;
  getDoctor(id);
  getDoctorCompanions(id);
}

document.querySelector("#create").onclick = () => {
  document.querySelector("#companions-list").innerHTML = "";
  document.querySelector("#doctor").innerHTML = `
  <div id="doctor-form">
    <form id="create-doctor">
      <div class="create-doctor-fields">
        <label for="name">Name</label>
        <input type="text" id="name" required>
        <label for="seasons">Seasons</label>
        <input type="text" id="seasons" required>
        <label for="ordering">Ordering</label>
        <input type="text" id="ordering">
        <label for="image_url">Image</label>
        <input type="text" id="image_url">
      </div>
    </form>
      <button class="btn btn-main" id="save-create" onclick="handleSaveCreate()">
        Save
      </button>
      <button class="btn" id="cancel" onclick="handleCancel()">Cancel</button>
      <h3 class="error" id="error-message">
        Error. Please fix the data.
      </h3>

  </div>
  `;
}

const handleCancel = () => {
  document.querySelector("#doctor").innerHTML = "";
}

const handleCancelEdit = () => {
  renderDoctor(selectedDoctor);
}

const handleSaveCreate = () => {
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

const handleSaveEdit = () => {
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
    patchDoctor(selectedDoctor._id, data);
}

const handleDelete = (event) => {
  if (confirm(`Are you sure you want to delete ${selectedDoctor.name}?`))
  {
    deleteDoctor(selectedDoctor._id);
    document.querySelector("#doctor").innerHTML = "";
    getDoctors();
  }
}

const handleEdit = (event) => {
  console.log(selectedDoctor);
  document.querySelector("#doctor").innerHTML = `
    <div id="doctor-form">
      <form id="create-doctor">
        <div class="create-doctor-fields">
          <label for="name">Name</label>
          <input type="text" id="name" value="${selectedDoctor.name}" required>
          <label for="seasons">Seasons</label>
          <input type="text" id="seasons" value="${selectedDoctor.seasons}" required>
          <label for="ordering">Ordering</label>
          <input
            type="text"
            id="ordering" 
            value="${selectedDoctor.ordering ? selectedDoctor.ordering : ""}"
          >
          <label for="image_url">Image</label>
          <input type="text" id="image_url" value="${selectedDoctor.image_url}">
        </div>
      </form>
        <button class="btn btn-main" id="save-create" onclick="handleSaveEdit()">
          Update
        </button>
        <button class="btn" id="cancel" onclick="handleCancelEdit()">
          Cancel
        </button>
        <h3 class="error" id="error-message">
          Error. Please fix the data.
        </h3>

    </div>
  `;
}

getDoctors();


// invoke this function when the page loads:
initResetButton();
