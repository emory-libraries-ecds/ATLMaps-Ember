**ATLMaps is in heavy development. Feel free to open an issue to make a feature request. If you want to use the code in your own project, please open an issue or contact [libsysdev-l@listserv.cc.emory.edu](mailto:libsysdev-l@listserv.cc.emory.edu).**

# About the ATLMaps Project
The ATLMaps platform, a collaboration between [Georgia State University](http://gsu.edu) and [Emory University](http://emory.edu), combines archival maps, geospatial data visualization, and user contributed multimedia location pinpoints to promote investigation into any number of issues about Atlanta. While currently focused on one city to demonstrate the power of stacking thousands of layers of information on one place, this innovative online platform will eventually allow users to layer an increasing number of interdisciplinary data to address the complex issues that any city poses. The project looks to offer a framework that incorporates storytelling reliant on geospatial data and for normalizing input across a range of data sets about so that material can be cross-compared in novel ways, allowing users to make connections between seemingly unrelated data sources and ask questions that would not be apparent when only looking at one particular project. The ATLMaps project will also encourage knowledgeable members of the university and local communities to curate data on the site to demonstrate the possibilities for synthesizing material across projects and data types.


# Architecture
ATLMaps is comprised three parts: ATLMaps-Server, ATLMaps Client, and a geographic information system (GIS) that exposes geospatial data via protocols established by the Open Geospatial Consortium, e.g. WMS, WFS, etc.

A person visiting atlmaps.com will load the ATLMaps-Client. The client is developed using [Ember.js](http://emberjs.com).

The ATLMaps-Server is a web application written in Ruby on Rails. It catalogues GIS data that a participating institution and allows curator to apply additional metadata.

![](https://s3.amazonaws.com/atlmaps-prod/ATLMapsDiagram.png)


# ATLMaps Client
This repository is for the ATLMaps client, i.e. front-end. The Client is built with [Ember JS](http://emberjs.com/).

# Server
The client draws all of the projects and maps from the ATLMaps Server. This is an API built with Ruby on Rails.


# License
This software is distributed under the Apache 2.0 License.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
