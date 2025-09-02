Project overview:

This is a API testing app which is named as "TestBird".Basically in early days birds like pigeons used to pass the msgs from one place to other.
In the same way API's work to make a talk between frontent and backend they act as a menu card that consists of rule based food and processes responses througn server.
To test these API's working TestBird has actually built.
Basically there is authentication as of any app and create account for new user.
When user enters the landing page the main function of this testing happens here , the API along with its methods like GET,POST,PUT,DEL are filled if neccessary body in JSON editor.
By clicking on send button it gets tested and response is displayed in the form of JSON format and Table format.
Inorder to store these requests for future use, these are kept in containers named collections.
These Collections are need to be created by user for storing req like get employess req in employee collection.
Generally these collections are loaded into users workspace whnever he gets loged in with respective req names in collections.





Features implemented :

SignIn & SignUp of user
Testing API with GET<POST<PUT<DEL
Loading JSON editor for POST and PUT
Adding of collections by users to his workspace 
Saving the tested req by entry of req name and collection selected by user into respective collection.
Opening of form to add request.
Retrieving the collections with their req whenever page is loaded.
Loading of saved requests into the page using load button.
Deletion of requests with delete button.



Issues:
To handle local host used app.use(cors)


