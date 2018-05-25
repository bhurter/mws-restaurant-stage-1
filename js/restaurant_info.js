let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      let myMap = document.getElementById('map');
      if (navigator.onLine) {
        self.map = new google.maps.Map(myMap, {
          zoom: 16,
          center: restaurant.latlng,
          scrollwheel: false
        });
        /* self.map = new google.maps.Map(myMap, {
          zoom: 16,
          center: restaurant.latlng,
          scrollwheel: false
        }); */
        DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

        google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
          document.querySelector('iframe').title = `Map of ${self.restaurant.name} and surrounding area`;
        });
      } else {
        myMap.innerHTML = '<h2 class = "inside-offline-map" tabindex = "0"> Map is not available when offline </h2>';
      /*  myMap.innerHTML = '<img id="offline-map" tabindex="0" src="/img/Offline.jpg" alt="Maps are not available while offline.  Maps copyright 2018 Google">';*/
      }
      fillBreadcrumb();
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.tabIndex = 0;
  name.setAttribute('aria-label', `Details for ${restaurant.name}`);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.tabIndex = 0;
  address.setAttribute('aria-label', `Address is ${restaurant.address}`);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.tabIndex = 0;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.photo_description;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.tabIndex = 0;
  cuisine.setAttribute('aria-label', `The restaurant cuisine is ${restaurant.cuisine_type}`);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.tabIndex = 0;
  hours.setAttribute('aria-label', `Restaurant operating hours`);
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.tabIndex = 0;

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.tabIndex = 0;
  title.setAttribute('aria-label', 'Resturant reviews');
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.tabIndex = 0;
    noReviews.setAttribute('aria-label', 'No reviews yet!');
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'reviews-header'
  name.tabIndex = 0;
  name.setAttribute('aria-label', `Review by ${review.name}`);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = 'reviews-date'
  date.tabIndex = 0;
  date.setAttribute('aria-label', `Reviewed on ${review.date}`);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'reviews-rating';
  rating.tabIndex = 0;
  rating.setAttribute('aria-label', `${review.name} gave a rating of ${review.rating}`);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'reviews-comments';
  comments.tabIndex = 0;
  comments.setAttribute('aria-label', `${review.name} says ${review.comments}`);
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
