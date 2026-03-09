const {
  withAppBuildGradle,
  withMainApplication,
} = require("expo/config-plugins");

function addFirebaseMessagingDependency(config) {
  return withAppBuildGradle(config, (mod) => {
    const contents = mod.modResults.contents;
    if (!contents.includes("firebase-messaging")) {
      mod.modResults.contents = contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation platform('com.google.firebase:firebase-bom:33.7.0')\n    implementation 'com.google.firebase:firebase-messaging'`,
      );
    }
    return mod;
  });
}

function addFirebaseInit(config) {
  return withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;
    if (!contents.includes("FirebaseApp")) {
      contents = contents.replace(
        "import android.app.Application",
        "import android.app.Application\nimport com.google.firebase.FirebaseApp",
      );
      contents = contents.replace(
        "super.onCreate()",
        "super.onCreate()\n    FirebaseApp.initializeApp(this)",
      );
      mod.modResults.contents = contents;
    }
    return mod;
  });
}

module.exports = function withFirebaseMessaging(config) {
  config = addFirebaseMessagingDependency(config);
  config = addFirebaseInit(config);
  return config;
};
