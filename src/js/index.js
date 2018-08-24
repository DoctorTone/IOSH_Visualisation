import "bootstrap/dist/css/bootstrap.min.css";
import "../css/IOSHStyles.css";

import $ from "jquery";
import "bootstrap";
import "popper.js";

//window.jQuery = $;
//window.$ = $;
import * as THREE from "three";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import { BaseApp } from "./baseApp";
import { SceneConfig } from "./sceneConfig";
import { TextLoader } from "./textLoader";
//import UserData from "../data/playerLog.txt";
let FBXLoader = require("three-fbx-loader");

let ControlKit = require("controlkit");

class Framework extends BaseApp {
    constructor() {
        super();

        this.simRunning = false;
        this.currentIndex = 0;
        this.playbackSpeed = 1;
        this.showTrails = true;
        this.dataLoader = new TextLoader();
        this.dataLoaded = false;
        this.startIndex = this.endIndex = 0;
        this.trails = [];
        this.times = [];
        this.simTimes = [];
        this.simPositions = [];
    }

    setContainer(container) {
        this.container = container;
    }

    init(container) {
        super.init(container);
    }

    createScene() {
        //Init base createsScene
        super.createScene();

        //Create root object.
        this.root = new THREE.Object3D();
        this.addToScene(this.root);

        //Add ground plane
        this.addGround();

        //Add user representation
        let userGeom = new THREE.SphereBufferGeometry(SceneConfig.UserRadius, SceneConfig.UserSegments, SceneConfig.UserSegments);
        let userMat = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
        let userMesh = new THREE.Mesh(userGeom, userMat);
        this.root.add(userMesh);
        this.userObject = userMesh;

        //Add trail representation
        let trailGeom = new THREE.SphereBufferGeometry(SceneConfig.UserRadius/4, SceneConfig.UserSegments, SceneConfig.UserSegments);
        let trailMat = new THREE.MeshLambertMaterial( {color: 0xff0000} );
        let trailMesh = new THREE.Mesh(trailGeom, trailMat);
        this.trailObject = trailMesh;

        //Load models

        let matLoader = new MTLLoader();
        let objLoader = new OBJLoader();

        matLoader.load('../models/pointer.mtl', (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load('../models/pointer.obj', (object) => {
                //object.scale.set(SceneConfig.UserScale, SceneConfig.UserScale, SceneConfig.UserScale);
                this.pointerStart = object;
                this.pointerEnd = object.clone();
                this.root.add(this.pointerStart);
                this.root.add(this.pointerEnd);
                this.pointerStart.visible = this.pointerEnd.visible = false;
            });
        });

        matLoader.load("../models/floor.mtl", (materials) => {
            materials.preload();
            //objLoader.setMaterials(materials);
            objLoader.load("../models/floor.obj", (object) => {
                //object.scale.set(SceneConfig.UserScale, SceneConfig.UserScale, SceneConfig.UserScale);
                object.rotation.y = Math.PI;
                object.position.y = SceneConfig.FloorHeight;
                this.root.add(object);
            });
        });

        /*
        let fbxLoader = new FBXLoader();

        fbxLoader.load("../models/floor_plan_3.fbx", (object) => {
            this.root.add(object);
        });
        */
    }

    generateData() {
        //Parse participant data
        let records = this.userData.split("\n");
        let numRecords = records.length;

        //DEBUG
        /*
        for(let i=0; i<12; ++i) {
            console.log("Record", i, "=", records[i]);
        }
        */

        //Get time and position
        let recordData;
        this.times.length = 0;
        this.simPositions.length = 0;
        for(let i=1; i<numRecords; ++i) {
            recordData = records[i].split(" ");
            if(recordData.length !== 4) {
                console.log("Invalid record number", i);
                continue;
            }
            this.times.push(recordData[0]);
            this.simPositions.push(new THREE.Vector3(parseFloat(recordData[1]), parseFloat(recordData[2]), parseFloat(recordData[3])));
        }

        //DEBUG
        //console.log("Times = ", times);

        let numTimes = this.times.length;
        this.maxIndex = numTimes - 1;
        //DEBUG
        //console.log("Max index = ", this.maxIndex);

        this.setStartTime(this.times[0]);
        this.setEndTime(this.times[numTimes-1]);
        this.setCurrentPlaybackTime(this.times[0]);

        //Get relative times
        let currentDate = new Date();
        //DEBUG
        //console.log("Current = ", currentDate);

        let millisecondTimes = [];
        let timeParts;
        for(let i=0; i<numTimes; ++i) {
            timeParts = this.times[i].split(":");
            currentDate.setHours(parseFloat(timeParts[0]));
            currentDate.setMinutes(parseFloat(timeParts[1]));
            currentDate.setSeconds(parseFloat(timeParts[2]));
            currentDate.setMilliseconds(parseFloat(timeParts[3]));
            millisecondTimes.push(currentDate.getTime());
        }

        //Get all times relative to zero
        let timeOffset = millisecondTimes[0];
        this.simTimes.length = 0;
        for(let i=0; i<numTimes; ++i) {
            this.simTimes.push(millisecondTimes[i] - timeOffset);
        }

        //DEBUG
        //console.log("simTimes = ", simTimes);

        //Create trail for each position
        //Delete trails if they already exist
        this.trails.length = 0;

        //DEBUG
        //console.log("Trails = ", this.trails);

        let trailRep;
        for(let i=0; i<numTimes; ++i) {
            trailRep = this.trailObject.clone();
            trailRep.visible = false;
            this.root.add(trailRep);
            trailRep.position.copy(this.simPositions[i]);
            //trailRep.position.multiplyScalar(SceneConfig.PosScale);
            trailRep.position.z *= -1;
            this.trails.push(trailRep);
        }

        this.userObject.position.copy(this.simPositions[0]);
        //May need to amplify space
        //this.userObject.position.multiplyScalar(SceneConfig.PosScale);
        this.userObject.position.z *= -1;
        //this.userObject.position.y += SceneConfig.UserHeight/2;
        //this.simTimes = simTimes;
        //this.times = times;
        //this.simPositions = positions;
        //this.trails = trails;
    }

    setUserDate(filename) {
        let dateParts = filename.split("_");
        if(dateParts.length < 4) {
            alert("Cannot get date from filename");
            return;
        }
        let date = dateParts[1] + "/" + dateParts[2] + "/" + dateParts[3];
        $("#userDate").html(date);
    }

    setStartTime(time) {
        //Take off seconds
        let timeParts = time.split(":");
        $('#startTime').html(timeParts[0] + ":" + timeParts[1].padStart(2, '0') + ":" + timeParts[2].padStart(2, '0'));
    }

    setEndTime(time) {
        //Take off seconds
        let timeParts = time.split(":");
        $('#endTime').html(timeParts[0] + ":" + timeParts[1].padStart(2, '0') + ":" + timeParts[2].padStart(2, '0'));
    }

    setCurrentPlaybackTime(time) {
        let timeParts = time.split(":");
        let status = this.simRunning ? " (x" + this.playbackSpeed + ")" : " (Paused)";
        $("#currentTime").html(timeParts[0] + ":" + timeParts[1].padStart(2, '0') + ":" + timeParts[2].padStart(2, '0') + ":" + timeParts[3].padStart(2, '0') + status);
    }

    createGUI() {
        //Create GUI - controlKit
        window.addEventListener('load', () => {
            let appearanceConfig = {
                Back: '#5c5f64',
                Ground: '#0c245c',
                Block: '#fffb37'
            };

            let controlKit = new ControlKit();

            let defaultWidth = 200;

            controlKit.addPanel({label: "Configuration", width: defaultWidth, enable: false})
                .addSubGroup({label: "Appearance", enable: false})
                .addColor(appearanceConfig, "Back", {
                    colorMode: "hex", onChange: () => {
                        this.onBackgroundColourChanged(appearanceConfig.Back);
                    }
                })
                .addColor(appearanceConfig, "Ground", {
                    colorMode: "hex", onChange: () => {
                        this.onGroundColourChanged(appearanceConfig.Ground);
                    }
                })
        });
    }

    onBackgroundColourChanged(colour) {
        this.renderer.setClearColor(colour, 1.0);
    }

    onGroundColourChanged(colour) {
        let ground = this.getObjectByName('Ground');
        if (ground) {
            ground.material.color.setStyle(colour);
        }
    }

    addGround() {
        //Ground plane
        let groundGeom = new THREE.PlaneBufferGeometry(SceneConfig.GroundWidth, SceneConfig.GroundHeight, SceneConfig.GroundSegments, SceneConfig.GroundSegments);
        let groundMat = new THREE.MeshLambertMaterial({color: 0xcdcdcd});
        let ground = new THREE.Mesh(groundGeom, groundMat);
        ground.name = "Ground";
        ground.position.y = SceneConfig.GroundOffset;
        ground.rotation.x = -Math.PI / 2;
        this.root.add(ground);
    }

    update() {
        let delta = this.clock.getDelta();

        if(this.simRunning) {
            this.elapsedTime += delta * 1000 * this.playbackSpeed;

            //DEBUG
            //console.log("Elapsed = ", this.elapsedTime);

            if(this.playbackSpeed > 0) {
                while(this.elapsedTime > this.simTimes[this.currentIndex+1]) {
                    this.moveToNextPosition();
                }
            } else {
                while(this.elapsedTime < this.simTimes[this.currentIndex-1]) {
                    this.moveToPreviousPosition();
                }
            }
            this.setCurrentPlaybackTime(this.times[this.currentIndex]);
        }

        super.update();
    }

    moveToNextPosition() {
       this.trails[this.currentIndex].visible = this.showTrails;

        ++this.currentIndex;
        //DEBUG
        //console.log("Current = ", this.currentIndex);
        if(this.currentIndex === this.maxIndex) {
            //DEBUG
            console.log("Reached the end");

            this.resetPlayBack(this.simTimes[this.currentIndex]);
        }
        this.userObject.position.copy(this.simPositions[this.currentIndex]);
        //May need to amplify space
        //this.userObject.position.multiplyScalar(SceneConfig.PosScale);
        this.userObject.position.z *= -1;
    }

    moveToPreviousPosition() {
        this.trails[this.currentIndex].visible = false;

        --this.currentIndex;
        if(this.currentIndex === 0) {
            //DEBUG
            console.log("Reached the start");

            this.resetPlayBack();
        }
        this.userObject.position.copy(this.simPositions[this.currentIndex]);
        //May need to amplify space
        //this.userObject.position.multiplyScalar(SceneConfig.PosScale);
        this.userObject.position.z *= -1;
    }

    stepToPreviousPosition() {
        if(--this.currentIndex < 0) {
            console.log("Can't go backwards from start");
            this.currentIndex = 0;
            return;
        }
        this.userObject.position.copy(this.simPositions[this.currentIndex]);
        this.elapsedTime = 0;
    }

    toggleSimulation() {
        //Ensure data loaded
        if(!this.dataLoaded) {
            alert("No data loaded!");
            return;
        }
        this.simRunning = !this.simRunning;
        this.playbackSpeed = 1;
        let elem = $("#playToggleImage");
        elem.attr("src", this.simRunning ? "images/pause-buttonWhite.png" : "images/play-buttonWhite.png");
        this.setCurrentPlaybackTime(this.times[this.currentIndex]);
    }

    fastForward() {
        if(this.playbackSpeed < 0) {
            this.playbackSpeed = 1;
        }
        this.playbackSpeed *= 2;
        if(this.playbackSpeed > SceneConfig.MaxPlaybackSpeed) {
            this.playbackSpeed = 1;
        }
        this.simRunning = true;
        $("#playToggleImage").attr("src", "images/pause-buttonWhite.png");
    }

    rewind() {
        if(this.playbackSpeed < 0) {
            this.playbackSpeed *= -1;
        }
        this.playbackSpeed *= 2;
        if(this.playbackSpeed > SceneConfig.MaxPlaybackSpeed) {
            this.playbackSpeed = 1;
        }
        //Convert back to negative as rewinding
        this.playbackSpeed *= -1;
        this.simRunning = true;
        $("#playToggleImage").attr("src", "images/pause-buttonWhite.png");
    }

    stepForward() {
        //Only step forward if paused
        if(this.simRunning) {
            console.log("Cannot step forward whilst playing");
            return;
        }

        this.moveToNextPosition();
        this.setCurrentPlaybackTime(this.times[this.currentIndex]);
    }

    stepBackward() {
        //Don't adjust anything if no data loaded
        if(!this.dataLoaded) {
            console.log("No data loaded");
            return;
        }
        //Only step backward if paused
        if(this.simRunning) {
            console.log("Cannot step backward whilst playing");
            return;
        }

        this.moveToPreviousPosition();
        console.log(this.times[this.currentIndex]);
        this.setCurrentPlaybackTime(this.times[this.currentIndex]);
    }

    toggleTrails() {
        this.showTrails = !this.showTrails;
    }

    setStartArrow() {
        if(!this.dataLoaded) return;

        this.pointerStart.visible = true;
        this.pointerStart.position.copy(this.simPositions[this.currentIndex]);
        this.pointerStart.position.y += SceneConfig.PointerHeight;
        this.startIndex = this.currentIndex;
        //DEBUG
        //console.log("Start index = ", this.startIndex);
        //May need to amplify space
        //this.pointerStart.position.multiplyScalar(SceneConfig.PosScale);
        this.pointerStart.position.z *= -1;
    }

    setEndArrow() {
        if(!this.dataLoaded) return;

        if(!this.pointerStart.visible) {
            console.log("Can't set end arrow if no start");
            return;
        }
        this.pointerEnd.visible = true;
        this.pointerEnd.position.copy(this.simPositions[this.currentIndex]);
        this.pointerEnd.position.y += SceneConfig.PointerHeight;
        this.endIndex = this.currentIndex;
        //DEBUG
        //console.log("End index = ", this.endIndex);
        //May need to amplify space
        //this.pointerEnd.position.multiplyScalar(SceneConfig.PosScale);
        this.pointerEnd.position.z *= -1;

        //Update distance metrics
        this.updateDistanceMetrics();
    }

    clearArrows() {
        this.pointerStart.visible = this.pointerEnd.visible = false;
    }

    reset() {
        this.simRunning = false;
        this.playbackSpeed = 1;
        this.currentIndex = 0;
        this.elapsedTime = 0;
        if(this.simPositions.length) {
            this.userObject.position.copy(this.simPositions[this.currentIndex]);
            this.userObject.position.z *= -1;
        }

        $("#playToggleImage").attr("src", "images/play-buttonWhite.png");
        if(this.times.length) {
            this.setCurrentPlaybackTime(this.times[this.currentIndex]);
        }
        //Hide trails
        for(let i=0, numTrails=this.trails.length; i<numTrails; ++i) {
            this.trails[i].visible = false;
        }
        //Hide pointers
        this.pointerStart.visible = this.pointerEnd.visible = false;
    }

    resetPlayBack(time) {
        //Reached start - reset everything
        this.elapsedTime = time;
        this.simRunning = false;
        this.playbackSpeed = 1;
        $("#playToggleImage").attr("src", "images/play-buttonWhite.png");
    }

    updateDistanceMetrics() {
        let distance = 0;
        //DEBUG
        //console.log("Start time = ", this.simTimes[this.startIndex]);
        //console.log("End time = ", this.simTimes[this.endIndex]);
        for(let i=this.startIndex; i< this.endIndex; ++i) {
            distance += this.simPositions[i].distanceTo(this.simPositions[i+1]);
        }

        //DEBUG
        //console.log("Distance = ", distance);
        let elapsedTime = (this.simTimes[this.endIndex] - this.simTimes[this.startIndex])/1000;
        let speed = distance/elapsedTime;
        $('#distance').html(distance.toFixed(2));
        $('#speed').html(speed.toFixed(2));
    }

    loadUserData(event) {
        let files = event.target.files;
        if(!files.length) {
            alert("No file specified!");
            return;
        }

        let dataFile = files[0];
        let filename = dataFile.name;
        if(filename.substr(-4) !== ".txt") {
            alert("Only .txt files allowed!");
            return;
        }

        //Update start date
        this.setUserDate(filename);
        window.URL = window.URL || window.webkitURL;

        let fileUrl = window.URL.createObjectURL(dataFile);
        this.dataLoader.load(fileUrl, data => {
            console.log("Data loaded");
            this.dataLoaded = true;
            this.userData = data;
            this.reset();
            this.generateData();
        });
    }
}

$(document).ready( () => {

    let container = document.getElementById("WebGL-output");
    let app = new Framework();
    app.setContainer(container);

    app.init(container);
    //app.createGUI();
    app.createScene();

    $('[data-toggle="tooltip"]').tooltip();

    $("#reset").on("click", () => {
        app.reset();
    });

    $("#playToggle").on("click", () => {
        app.toggleSimulation();
    });

    $("#stepBackward").on("click", () => {
        app.stepBackward();
    });

    $("#fastForward").on("click", () => {
        app.fastForward();
    });

    $("#rewind").on("click", () => {
        app.rewind();
    });

    $("#stepForward").on("click", () => {
        app.stepForward();
    });

    $("#backColour").on("change", () => {
        let backColour = $("#backColour").val();
        app.onBackgroundColourChanged(backColour);
    });

    $("#groundColour").on("change", () => {
        let groundColour = $("#groundColour").val();
        app.onGroundColourChanged(groundColour);
    });

    $('#loadFile').on("click", evt => {
        $('#loadFileType').trigger('click');
    });

    $('#loadFileType').on("change", evt => {
        app.loadUserData(evt);
    });

    $('#checkTrail').on("change", () => {
        app.toggleTrails();
    });

    $('#markStart').on("click", () => {
        app.setStartArrow();
    });

    $('#markEnd').on("click", () => {
        app.setEndArrow();
    });

    $('#clearMarks').on("click", () => {
        app.clearArrows();
    });

    app.run();
});
