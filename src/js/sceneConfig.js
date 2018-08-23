// General parameters to help with setting up scene

const SceneConfig = {
    clearColour: 0x5c5f64,
    ambientLightColour: 0x383838,
    pointLightColour: 0xffffff,
    CameraPos: {
        x: 182,
        y: 50,
        z: 340
    },
    LookAtPos: {
        x: -70,
        y: -20,
        z: 40
    },
    NEAR_PLANE: 0.1,
    FAR_PLANE: 10000,
    FOV: 45,
    GroundWidth: 2000,
    GroundHeight: 1000,
    GroundSegments: 16,
    UserWidth: 5,
    UserHeight: 20,
    UserScale: 5,
    UserRadius: 1,
    UserSegments: 16,
    SecondsOffset: 1532900000000,
    MaxPlaybackSpeed: 16,
    PosScale: 10,
    FloorHeight: 3.84
};

export { SceneConfig };