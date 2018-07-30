import "bootstrap/dist/css/bootstrap.min.css";
import "../css/IOSHStyles.css";

import $ from "jquery";
//window.jQuery = $;
//window.$ = $;
import * as THREE from "three";
import { BaseApp } from "./baseApp";
import { SceneConfig } from "./sceneConfig";
import UserData from "../data/playerLog.txt";

let ControlKit = require("controlkit");

class Framework extends BaseApp {
    constructor() {
        super();

        this.simRunningnning = false;
        this.currentIndex = 0;
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
        let userGeom = new THREE.CylinderBufferGeometry(SceneConfig.UserWidth, SceneConfig.UserWidth, SceneConfig.UserHeight, SceneConfig.UserSegments, SceneConfig.UserSegments);
        let userMat = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
        let userMesh = new THREE.Mesh(userGeom, userMat);
        this.root.add(userMesh);
        this.userMesh = userMesh;
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

        this.setStartTime(times[0]);

        //Get relative times
        let currentDate = new Date();
        //DEBUG
        //console.log("Current = ", currentDate);

        let millisecondTimes = [];
        let timeParts;
        for(let i=0,numTimes=times.length; i<numTimes; ++i) {
            timeParts = times[i].split(":");
            currentDate.setHours(parseFloat(timeParts[0]));
            currentDate.setMinutes(parseFloat(timeParts[1]));
            currentDate.setSeconds(parseFloat(timeParts[2]));
            currentDate.setMilliseconds(parseFloat(timeParts[3]));
            millisecondTimes.push(currentDate.getTime() - SceneConfig.SecondsOffset);
        }

        //DEBUG
        //console.log("Milliseconds = ", millisecondTimes);

        this.userMesh.position.copy(positions[0]);
        this.userMesh.position.y += SceneConfig.UserHeight/2;
        //DEBUG
        console.log("Y pos = ", this.userMesh.position.y);
        this.simTimes = millisecondTimes;
        this.simPositions = positions;
    }

    setStartTime(time) {
        //Take off seconds
        let timeParts = time.split(":");
        $('#userStart').html(timeParts[0] + ":" + timeParts[1]);
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
        super.update();
        let delta = this.clock.getDelta();

        if(this.simRunning) {
            this.elapsedTime += delta * 1000;

            //DEBUG
            console.log("Elapsed = ", this.elapsedTime);

            //DEBUG
            let next = this.simTimes[this.currentIndex+1];
            let current = this.simTimes[this.currentIndex];
            console.log("Next - current = ", next-current);
            if(this.elapsedTime > (next - current)) {
                ++this.currentIndex;
                this.userMesh.position.copy(this.simPositions[this.currentIndex]);
                //DEBUG
                this.userMesh.position.z *= 10;
                this.elapsedTime = 0;
            }
        }
    }

    toggleSimulation() {
        this.simRunning = !this.simRunning;
        let elem = $("#playToggleImage");
        elem.attr("src", this.simRunning ? "images/pause-button.png" : "images/play-button.png");
    }
}

$(document).ready( () => {

    let container = document.getElementById("WebGL-output");
    let app = new Framework();
    app.setContainer(container);

    app.init(container);
    //app.createGUI();
    app.createScene();
    app.generateData();

    $("#playToggle").on("click", () => {
        app.toggleSimulation();
    });

    $("#backColour").on("change", () => {
        let backColour = $("#backColour").val();
        app.onBackgroundColourChanged(backColour);
    });

    $("#groundColour").on("change", () => {
        let groundColour = $("#groundColour").val();
        app.onGroundColourChanged(groundColour);
    });

    app.run();
});
