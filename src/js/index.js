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

let ControlKit = require("controlkit");

class Framework extends BaseApp {
    constructor() {
        super();

        this.simRunningnning = false;
        this.currentIndex = 0;
        this.playbackSpeed = 1;
        this.dataLoader = new TextLoader();
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
        /*
        let userGeom = new THREE.CylinderBufferGeometry(SceneConfig.UserWidth, SceneConfig.UserWidth, SceneConfig.UserHeight, SceneConfig.UserSegments, SceneConfig.UserSegments);
        let userMat = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
        let userMesh = new THREE.Mesh(userGeom, userMat);
        this.root.add(userMesh);
        this.userMesh = userMesh;
        */

        //Load models
        let matLoader = new MTLLoader();
        let objLoader = new OBJLoader();

        matLoader.load('../models/capsule.mtl', (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load('../models/capsule.obj', (object) => {
                this.userObject = object;
                this.userObject.scale.set(SceneConfig.UserScale, SceneConfig.UserScale, SceneConfig.UserScale);
                this.root.add(this.userObject);
                //this.generateData();
            });
        });
    }

    generateData() {
        //Parse participant data
        //Update start date
        $('#userDate').html("23rd July 2018");
        let records = UserData.split("\n");
        let numRecords = records.length;

        //DEBUG
        /*
        for(let i=0; i<12; ++i) {
            console.log("Record", i, "=", records[i]);
        }
        */

        //Get time and position
        let recordData;
        let times = [], positions = [];
        for(let i=1; i<numRecords; ++i) {
            recordData = records[i].split(" ");
            if(recordData.length !== 4) {
                console.log("Invalid record number", i);
                continue;
            }
            times.push(recordData[0]);
            positions.push(new THREE.Vector3(parseFloat(recordData[1]), parseFloat(recordData[2]), parseFloat(recordData[3])));
        }

        //DEBUG
        //console.log("Times = ", times);

        let numTimes = times.length;
        this.setStartTime(times[0]);
        this.setEndTime(times[numTimes-1]);
        this.setCurrentPlaybackTime(times[0]);

        //Get relative times
        let currentDate = new Date();
        //DEBUG
        //console.log("Current = ", currentDate);

        let millisecondTimes = [];
        let timeParts;
        for(let i=0; i<numTimes; ++i) {
            timeParts = times[i].split(":");
            currentDate.setHours(parseFloat(timeParts[0]));
            currentDate.setMinutes(parseFloat(timeParts[1]));
            currentDate.setSeconds(parseFloat(timeParts[2]));
            currentDate.setMilliseconds(parseFloat(timeParts[3]));
            millisecondTimes.push(currentDate.getTime() - SceneConfig.SecondsOffset);
        }

        //DEBUG
        //console.log("Milliseconds = ", millisecondTimes);

        this.userObject.position.copy(positions[0]);
        this.userObject.position.y += SceneConfig.UserHeight/2;
        this.simTimes = millisecondTimes;
        this.times = times;
        this.simPositions = positions;
    }

    setStartTime(time) {
        //Take off seconds
        let timeParts = time.split(":");
        $('#startTime').html(timeParts[0] + ":" + timeParts[1] + ":" + timeParts[2]);
    }

    setEndTime(time) {
        //Take off seconds
        let timeParts = time.split(":");
        $('#endTime').html(timeParts[0] + ":" + timeParts[1] + ":" + timeParts[2]);
    }

    setCurrentPlaybackTime(time) {
        let timeParts = time.split(":");
        let status = this.simRunning ? " (x" + this.playbackSpeed + ")" : " (Paused)";
        $("#currentTime").html(timeParts[0] + ":" + timeParts[1] + ":" + timeParts[2] + status);
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
        ground.rotation.x = -Math.PI / 2;
        this.root.add(ground);
    }

    update() {
        let delta = this.clock.getDelta();

        if(this.simRunning) {
            this.elapsedTime += delta * 1000 * this.playbackSpeed;

            //DEBUG
            //console.log("Elapsed = ", this.elapsedTime);

            let next = this.simTimes[this.currentIndex+1];
            let current = this.simTimes[this.currentIndex];
            //DEBUG
            //console.log("Next - current = ", next-current);
            this.setCurrentPlaybackTime(this.times[this.currentIndex]);
            if(this.elapsedTime > (next - current)) {
                this.moveToNextPosition();
            }
        }

        super.update();
    }

    moveToNextPosition() {
        ++this.currentIndex;
        this.userObject.position.copy(this.simPositions[this.currentIndex]);
        //DEBUG
        this.userObject.position.z *= 10;
        this.elapsedTime = 0;
    }

    moveToPreviousPosition() {
        --this.currentIndex;
        this.userObject.position.copy(this.simPositions[this.currentIndex]);
        //DEBUG
        this.userObject.position.z *= 10;
        this.elapsedTime = 0;
    }

    toggleSimulation() {
        this.simRunning = !this.simRunning;
        let elem = $("#playToggleImage");
        elem.attr("src", this.simRunning ? "images/pause-buttonWhite.png" : "images/play-buttonWhite.png");
        this.setCurrentPlaybackTime(this.times[this.currentIndex]);
    }

    fastForward() {
        this.playbackSpeed *= 2;
        if(this.playbackSpeed > SceneConfig.MaxPlaybackSpeed) {
            this.playbackSpeed = 1;
        }
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
        //Only step backward if paused
        if(this.simRunning) {
            console.log("Cannot step backward whilst playing");
            return;
        }

        this.moveToPreviousPosition();
        console.log(this.times[this.currentIndex]);
        this.setCurrentPlaybackTime(this.times[this.currentIndex]);
    }

    reset() {
        this.simRunning = false;
        this.playbackSpeed = 1;
        this.currentIndex = 0;
        this.elapsedTime = 0;
        this.userObject.position.copy(this.simPositions[this.currentIndex]);
        $("#playToggleImage").attr("src", "images/play-buttonWhite.png");
        this.setCurrentPlaybackTime(this.times[this.currentIndex]);
    }

    loadUserData(event) {
        let files = event.target.files;
        if(!files.length) {
            alert("No file specified!");
            return;
        }

        let dataFile = files[0];
        window.URL = window.URL || window.webkitURL;

        let fileUrl = window.URL.createObjectURL(dataFile);
        this.dataLoader.load(fileUrl, data => {
            console.log("Data = ", data);
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

    app.run();
});
