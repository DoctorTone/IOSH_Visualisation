import "bootstrap/dist/css/bootstrap.min.css";
import "../css/IOSHStyles.css";

import $ from "jquery";
//window.jQuery = $;
//window.$ = $;
import * as THREE from "three";
import { BaseApp } from "./baseApp";
import { SceneConfig } from "./sceneConfig";
import txt from "../data/playerLog.txt";

let ControlKit = require("controlkit");

class Framework extends BaseApp {
    constructor() {
        super();

        this.appRunning = false;
        this.currentTeam = 0;
        this.currentLogo = null;
        this.animating = false;
        this.animationEnded = true;
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

        //DEBUG
        console.log("Text file = ", txt);
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
    }
}

$(document).ready( () => {

    let container = document.getElementById("WebGL-output");
    let app = new Framework();
    app.setContainer(container);

    app.init(container);
    //app.createGUI();
    app.createScene();

    $("#guiOption").on("click", () => {
        $("#guiTab").fadeOut( () => {
            $("#guiTabExpanded").removeClass("d-none");
        });
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
