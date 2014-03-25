Bike - Will Bradley
====================

[Here (http://nearbyparking.co)](http://nearbyparking.co/) is an implementation of a Bike parking spot finder. 

# Notes
* I chose to implement the Bicycle Parking project because cycling is something I enjoy. I commute to work
on my bike often.

* This is a full-stack implementation
* I focused on architecture, ease of adding new features, and user interactivity over deployment or testing.
* The app design is responsive to mobile, tablet, and desktop environments.

## Technical Choices
  - RPCs
    +  This project was heavily geared towards the need to make Web RPCs either from the client or the server to Google, to compute directions and gather geolocation data. I feel that message-passing, event-driven architectures are more robust, so I explored a bit in this area. I've been playing around with SocketIO and React.js. I thought this would be a good opportunity to try combining a few of these technologies.
    + In order to avoid the nuisance that is JSONP (to avoid XSS issues), I chose to marshall Web RPCs through the server via SocketIO.
  - MVC
    + The M - Backbone is the client-side data storage modeling tool, but I purposefully avoided using any of the 'VC' from Backbone...
    + The V - I found React.js a joy to work due to its performance characteristics, and decent syntax.
    + The C - for my control logic, I just used simple old-fashioned hand-rolled Coffeescript.
    + Because of the choice to separate out concerns for the front-end using Backbone, and React.js, I was able to find a nice pattern for building structured view hierarchies. I used a pre-built mixin [react-backbone](https://github.com/usepropeller/react.backbone) which addressed this combination nicely.
  - Backend storage
    + Python running Flask - I chose not to implement this in Django. Django is fine, I use it every day at work, but I wanted something a little looser and less opinionated for this project.
    + Running Peewee ORM on top of sqlite3 - I chose a simple backend tech stack since this project did not involve much local storage. The database is just a cache as I accept no input from the users yet.  Peewee has a pretty nice simple ORM syntax, not too unlike Django. It's a bit more candy-coated with overloaded query-expression operators.
    + As of now, it is necessary to manually update the database with Parking Spot data by running a simple 'import' task. This could be cleaned up and made into a cron job that emits tasks into a worker queue.
  - Hosting [link](http://nearbyparking.co/)
    + I spent very little time on hosting and deployment for this project. I wanted to focus on building product and not worry too much about deployment.
    + The project is hosted by Digital Ocean. They're dirt cheap and the machines are fast for the price. And, they're always on (unlike Heroku).
  - Source control - The code is hosted here [https://github.com/wbbradley/bike](https://github.com/wbbradley/bike), but for the time being I'm only handing out the code via a zip file, to avoid too much premature worrying on the account of my current employer.

## Woulda Shoulda

* I leave finding code smells as an exercise for the reader. Nevertheless, I will acknowledge that my coding style treads on the side of *less* commenting. I typically find it unnecessary and generally foolish to add so many comments that they themselves must be maintained and introduce technical debt, however, a strategically placed comment here or there will always do the trick.
* I did not write a single test for this project for a couple reasons, we can discuss in person. In short, I tried to add a healthy amount of logging, and handle most if not all possible error conditions gracefully.

