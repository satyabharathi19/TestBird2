Project Overview:
TestBird is an API testing application inspired by how birds historically carried messages between places.
Similarly, APIs serve as communication bridges between frontend and backend systems, acting like menu cards that define processes and handle server responses.
The application features complete authentication with sign-in and sign-up capabilities. Once logged in,
users can test APIs using various HTTP methods (GET, POST, PUT, DELETE) with support for query parameters, headers, and 
different body types including form-data, raw JSON, binary files, and GraphQL queries through an integrated JSON editor.
When users click "Send," the API is tested and responses are displayed in both JSON and tabular formats, along with response status, 
time, and size information. The app supports both public and localhost API testing.
For organization, users can save requests in "Collections" - containers that group related APIs 
(e.g., employee requests in an "Employee Collection"). 
These collections automatically load into the user's workspace upon login, providing a persistent testing environment with all saved requests, URLs, methods, and request bodies readily accessible.





Features implemented :

1.Basic Auth (Sign In & Sign Up).
2.Can test HTTP Request Methods - GET, POST, PUT, DELETE.
3.Implemented Query Params, Headers,Body and Autherization.
4.Can test APIs with different body types including:
    form-data, raw, binary, and GraphQL (files and queries)
5.Can test both public and localhost APIs.
6.Save tested APIs and add them to user collections and requests along with API 
    URL,method, and body.
7.Load the user's workspace containing saved collections and requests when the user 
    logs  in.
8.Implemented Response Status, Response Size, and Response Time display while 
    retrieving responses.
9.Integrated JSON Editor and loading indicators.
10.Implemented tabular response view along with JSON response view.



