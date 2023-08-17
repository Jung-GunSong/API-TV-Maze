"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $('#episodesList')
const $searchForm = $("#searchForm");
const PLACEHOLDER_IMAGE = 'https://tinyurl.com/tv-missing';
const $episodeButton = $(".Show-getEpisodes");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  const q = searchTerm;//could throw error if not string
  const params = new URLSearchParams({ q });
  const response = await fetch(`https://api.tvmaze.com/search/shows?${params}`);

  const data = await response.json();

  const showArray = data.map((obj) => {
    const newShow = {
      id: obj.show.id,
      name: obj.show.name,
      summary: obj.show.summary,
      image: obj.show.image ? obj.show.image.medium : PLACEHOLDER_IMAGE
    };

    return newShow;
  });

  return showArray;
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

/**
 * Handles form submit and updates DOM with shows that match search criteria.
 */
$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/**
 * Handles button click to see episodes of a particular show and adds the list
 * of episodes to the DOM after getting data back.
 */
$showsList.on('click', $episodeButton, async function handleGetEpisode(evt) {
  //TODO: take a look at jQuery closest and see if we can use to refactor
  const id = $(evt.target).closest(".Show").attr('data-show-id');

  await getEpisodesAndDisplay(id);
})


/**
 * @param {string} id - takes in string id and returns array of episode objects
 * @returns {Promise<array>} episodes array {id, name, season, number}
 */
async function getEpisodesOfShow(id){
  // const params = new URLSearchParams(id);
  const response = await fetch(`http://api.tvmaze.com/shows/${id}/episodes`);

  const data = await response.json();

  const episodes = data.map((obj) => {
    const episode = {
      id: obj.id,
      name: obj.name,
      season: obj.season,
      number: obj.number
    };

    return episode;
  })

  return episodes;
}


/**
 *
 * @param {array} episodes - takes in array of episodes and appends a li for each
 */
function displayEpisodes(episodes){

  $episodesList.empty();
  $episodesArea.show();

  for (const episode of episodes) {
    const newEpisodeLi = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`)

    $episodesList.append(newEpisodeLi);
  }

}

/**
 *
 * @param {string} id - takes in an id in the form of a string, gets episodes
 * of show, and then appends them to the DOM
 */
async function getEpisodesAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);

  displayEpisodes(episodes);
}