/* 
  todo: apagar y encender pantallas con funciones.
  todo: agregar efecto de sonido encendido al encender la pokedex
  todo: agregar efecto de brillo a las pantallas al encender la pokedex
  todo: agregar mensaje de bienvenida speech synthesis.
*/

const d = document,
  synth = window.speechSynthesis,
  utterThis = new SpeechSynthesisUtterance(),
  $mainScreen = d.querySelector(".screen"),
  $secondScreen = d.querySelector(".pokeindex-right__screen"),
  $nameScreen = d.querySelector(".controller-touch"),
  $search = d.querySelector(".input-poke"),
  $lightSpeak = d.querySelector(".circle-big"),
  $lightSpeakSmall = d.querySelector(".status-light"),
  $btnPlay = d.querySelector(".btn-play"),
  $btnPause = d.querySelector(".btn-pause"),
  $btnOn = d.querySelector(".buttons-circle");

let voices = [];

const speakPokedex = (
  name,
  type,
  species,
  mainAttack,
  detail,
  detail2,
  detail3
) => {
  const phrase = `
    ${name}. Pokémon tipo ${type}. Perteneciente a la especie ${species}. 
    Su ataque más poderoso es: ${mainAttack}. ${detail} ${detail2} ${detail3}
  `;
  utterThis.text = phrase;
  utterThis.voice = voices[65];
  utterThis.rate = 1.3;
  console.log(synth);
  console.log(utterThis);

  if (synth.speaking) {
    synth.cancel();
    synth.speak(utterThis);
  }

  synth.speak(utterThis);

  utterThis.onstart = () => {
    $lightSpeak.classList.add("is-speak");
    $lightSpeakSmall.classList.add("is-speak");
  };

  utterThis.onend = () => {
    $lightSpeak.classList.remove("is-speak");
    $lightSpeakSmall.classList.remove("is-speak");
  };
};

async function getDataPokemon() {
  let pokeApi = `http://pokeapi.co/api/v2/pokemon/${$search.value}`;

  try {
    $secondScreen.innerHTML = `<img class="loader" src="assets/puff.svg" alt="Cargando...">`;
    $mainScreen.innerHTML = `<img class="loader" src="assets/puff.svg" alt="Cargando...">`;

    let res = await fetch(pokeApi);
    pokemon = await res.json();

    if (!res) throw { status: res.status, statusText: res.statusText };

    $mainScreen.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    `;

    $nameScreen.innerHTML = `
      <p>${pokemon.name.toUpperCase()}</p>
    `;

    try {
      let res = await fetch(pokemon.types[0].type.url);
      pokemonType = await res.json();

      if (!res) throw { status: res.status, statusText: res.statusText };

      $secondScreen.innerHTML = `
        <p>Tipo: ${pokemonType.names[4].name}</p>
        <br>
      `;
    } catch (error) {
      console.log(error);
    }

    $secondScreen.innerHTML += `
        <p>Ataques:</p>
        <br>
        <ul>
          <li>${pokemon.moves[0].move.name}</li>
          <br>
          <li>${pokemon.moves[1].move.name}</li>
          <br>
          <li>${pokemon.moves[2].move.name}</li> 
        </ul>
      `;

    try {
      let res = await fetch(pokemon.species.url),
        pokemonSpecies = await res.json();

      if (!res) throw { status: res.status, statusText: res.statusText };

      $secondScreen.innerHTML += `
        <br><br><br>
        <p>Especie: ${pokemonSpecies.genera[5].genus}</p>
      `;

      let pokemonDetails = pokemonSpecies.flavor_text_entries;

      const detailsPokemon = pokemonDetails.filter(
        (detail) => detail.language.name === "es"
      );

      speakPokedex(
        pokemon.name,
        pokemonType.names[4].name,
        pokemonSpecies.genera[5].genus,
        pokemon.moves[0].move.name,
        detailsPokemon[0].flavor_text.replace(/\n/g, " "),
        detailsPokemon[1].flavor_text.replace(/\n/g, " "),
        detailsPokemon[2].flavor_text.replace(/\n/g, " ")
      );
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    let message = error.statusText || "Ha ocurrido un error";
    $mainScreen.innerHTML = `😮: ${message}`;
    $secondScreen.innerHTML =
      "<p>No encontramos lo que buscabas, intentalo nuevamente...</p>";
  }
}

const onPokedex = () => {
  $btnOn.classList.remove("is-off");
  $btnOn.style.background = "#8cc6ff";
  $mainScreen.style.background = "#474445";
  $secondScreen.style.background = "#474445";
};

const offPokedex = () => {
  $btnOn.classList.add("is-off");
  $btnOn.style.background = "#474445";
  $mainScreen.style.background = "#000000";
  $secondScreen.style.background = "#000000";
  synth.cancel();
  $mainScreen.innerHTML = "";
  $secondScreen.innerHTML = "";
  $nameScreen.innerHTML = "";
  $search.value = "";
  $lightSpeak.classList.remove("is-speak");
  $lightSpeakSmall.classList.remove("is-speak");
};

/* Delegación de Eventos */
d.addEventListener("click", (e) => {
  e.preventDefault();

  if (!$btnOn.classList.contains("is-off")) {
    if (e.target.matches(".btn-buscar")) {
      $search.value !== ""
        ? getDataPokemon()
        : alert(
            "Debe ingresar el numero o nombre del pokémon que desea buscar"
          );
    }

    if (e.target.matches(".btn-stop")) synth.cancel();

    if (e.target.matches(".btn-play") || e.target.matches(".btn-play img")) {
      synth.resume();
      $lightSpeak.classList.add("is-speak");
      $lightSpeakSmall.classList.add("is-speak");
    }

    if (e.target.matches(".btn-pause") || e.target.matches(".btn-pause img")) {
      synth.pause();
      $lightSpeak.classList.remove("is-speak");
      $lightSpeakSmall.classList.remove("is-speak");
    }
  }

  if (
    e.target.matches(".buttons-circle") ||
    e.target.matches(".buttons-circle img")
  ) {
    $btnOn.classList.contains("is-off") ? onPokedex() : offPokedex();
  }
});

d.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    $search.value !== ""
      ? getDataPokemon()
      : alert("Debe ingresar el numero o nombre del pokémon que desea buscar");
  }
});

d.addEventListener("DOMContentLoaded", (e) => {
  window.speechSynthesis.addEventListener("voiceschanged", (e) => {
    voices = window.speechSynthesis.getVoices();
  });
  synth.cancel();
  $btnOn.classList.add("is-off");
});
