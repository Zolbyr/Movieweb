const getData = async () => {
  const response = await fetch(
    "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
    {
      method: "GET",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNzI5MDBhMDJlOTk5OTc4ZWJhNWU5NDcyNWQyZWYzNyIsIm5iZiI6MTc2MzUyMzYxMC4xNTIsInN1YiI6IjY5MWQzYzFhZWViNzJmMTZmNGMyYTcwZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jJiFscoR5GNt3BBn9yMSS8BJMDbt9mcBdXK4x10Aoao",
        accept: "application/json",
      },
    }
  );

  const data = await response.json();
  console.log(response);
};

getData();
