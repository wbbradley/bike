Bike - Will Bradley
====================

Here is an implementation of a Bike parking spot finder. 

# Notes
* I chose to implement the Bicycle Parking project because cycling is something I enjoy. I commute to work
on my bike often.

* This is a full-stack implementation
* The decisions I made and the state of where I now end this project are based largely on my desire to build a working project in a short amount of time. So, I cut some corners with regards to deployment, but hopefully the cleanliness and scalability of the architecture, both front and back-ends, will shine through. As well as having a nice clean UX finish. It's not polished, by any means, but it shows the requisite data fairly plainly and should be relatively easy to use.

## Technical Choices
  - RPCs
    +  This project was heavily geared towards the need to make Web RPCs either from the client or the server to Google, in order to compute directions and get geolocation data. Recently I've taken an interest in more message-passing, event-driven architectures. I explored a bit in this area. I've been playing around with SocketIO and React.js, so I thought this would be a good opportunity to try combining a few different technologies.
    + In order to avoid the nuisance that is JSONP (to avoid XSS issues), I chose to marshall Web RPCs through the server via SocketIO.
  - MVC
    + Backbone is the client-side data storage modeling tool *(M)VC*, but I purposefully avoided using any of the 'VC' from Backbone, replacing them with React.js *M(V)C* and simple old hand-rolled Coffeescript for the *MV(C)*.
    + Because of the choice to separate out concerns for the front-end using Backbone, and React.js, I was able to find a nice pattern for building structured view hierarchies. After noticing the pattern I was able to find and use a pre-built mixin [react-backbone](https://github.com/usepropeller/react.backbone) which addressed this combination nicely.
  - Backend storage
    + Python running Flask
    + Running Peewee ORM on top of sqlite3 - I chose a simple backend tech stack since this project did not involve much local storage. The database is just a cache so that the backend avoids frequent fetches from the web. As of now, it is necessary to manually update the database with Parking Spot data by running a simple 'import' task. This could be cleaned up and made into a cron job that emits tasks into a worker queue.
  - Hosting [link](http://nearbyparking.co/)
    + I spent very little time on hosting and deployment for this project. I wanted to focus on building product and not worry too much about deployment.
  - Source control [https://github.com/wbbradley/bike](https://github.com/wbbradley/bike)

## Woulda Shoulda

* I leave finding code smells as an exercise for the reader. Nevertheless, I will acknowledge that my coding style treads on the side of *less* commenting. I typically find it unnecessary and generally foolish to add so many comments that they themselves must be maintained and introduce technical debt.
* I did not write a single test for this project for a couple reasons, we can discuss in person. In short, I tried to add a healthy amount of logging, and handle most if not all possible error conditions gracefully.

