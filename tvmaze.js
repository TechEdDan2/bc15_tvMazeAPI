"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const ROOT_API_URL = 'https://api.tvmaze.com/'

/**
 * Given a search term, search for tv shows that match that query.
 * 
 * @param {String} term - target search term  
 * @returns Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
  try {
    const response = await axios({
      method: 'get',
      baseURL: ROOT_API_URL,
      url: 'search/shows',
      params: {
        q: term,
      },
    });

    // Returns the newly created array populated with the results 
    //  of calling a function on every element in the data array 
    //  to extract the id, name, summary, and image
    return response.data.map(function (item) {
      const showInfo = item.show;
      return {
        id: showInfo.id,
        name: showInfo.name,
        summary: showInfo.summary,
        image: showInfo.image.original
      }
    });

  } catch (err) {
    alert(`Something went wrong looking for ${term}`);
  }

}


/**
 * Given list of shows, create markup for each and to DOM
 *  using jQuery 
 * 
 * @param {Array} shows 
 */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
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


/** 
 * Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/**
 * Given a show ID, get data from the API about episodes
 * 
 * @param {number} id - the id for the show
 * @returns array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  const response = await axios({
    baseURL: ROOT_API_URL,
    url: `shows/${id}/episodes`,
    method: 'get',
  });

  // Returns the newly created array populated with the results 
  //  of calling a function on every element in the data array 
  //  to extract the id, name, summary, and image
  return response.data.map(function (episode) {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  });

}

/**
 * 
 * 
 * @param {Array} episodes - list of a show's episodes { id, name, season, number} 
 */
function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(`<li>${episode.number}. ${episode.name} from season ${episode.season}</li>`);
    $episodesList.append($item);
  }
  $episodesArea.show();
}

/**
 * Handle search to get show episodes from API and display.
 *  Show episodes area 
 * 
 * @param {Event} e 
 */
async function searchForEpisodeAndDisplay(e) {
  const targetShowId = $(e.target).closest(".Show").data('show-id');

  const allEpisodes = await getEpisodesOfShow(targetShowId);

  populateEpisodes(allEpisodes);

}

//Event Listener waiting for a click on the Episodes button element
$showsList.on("click", ".Show-getEpisodes", searchForEpisodeAndDisplay);

