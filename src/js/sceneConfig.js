// General parameters to help with setting up scene

const SceneConfig = {
    clearColour: 0x5c5f64,
    ambientLightColour: 0x383838,
    pointLightColour: 0xffffff,
    CameraPos: {
        x: 66,
        y: 60,
        z: 75
    },
    LookAtPos: {
        x: -10,
        y: -10,
        z: -15
    },
    fireLargePos: {
        x: 19.5,
        y: 4,
        z: 13
    },
    fireLargeScale: {
        x: 3,
        y: 3,
        z: 1
    },
    fireSmallPos: {
        x: 3,
        y: 4,
        z: 35.5
    },
    fireSmallScale: {
        x: 1.5,
        y: 1.5,
        z: 1
    },
    WHITEBOARD_WIDTH: 4.5,
    WHITEBOARD_HEIGHT: 2,
    WHITEBOARD_DEPTH: 0.25,
    WHITEBOARD_ROT_Y: Math.PI/2,
    WhiteBoardPos: {
        x: 0.15,
        y: 4.5,
        z: 30.94
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
    GroundOffset: -4,
    FloorHeight: 3.25,
    PointerHeight: 2,
    RIGHT: 0,
    LEFT: 1,
    ZOOM_SPEED: 0.1
};

export { SceneConfig };