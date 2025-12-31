---
description: Build a release APK for Android
---

To build a release APK for your React Native app, follow these steps:

### 1. Generate an upload key
If you don't have one, run this command in your terminal (replace `my-upload-key` and `my-key-alias` with your preferred names):

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

> [!NOTE]
> Keep this file safe! If you lose it, you won't be able to update your app on the Play Store.

### 2. Configure Gradle variables
Place the keystore file in the `android/app` directory. Then, edit `android/gradle.properties` and add the following (replace with your actual values):

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

### 3. Add signing config to Gradle
Edit `android/app/build.gradle` and update the `signingConfigs` and `buildTypes`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 4. Build the APK
Run the following command in the `android` directory:

```powershell
./gradlew assembleRelease
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

---

### Alternative: Build a Debug APK (Easiest)
If you just want an APK for testing and don't care about signing yet, run:

```powershell
cd android
./gradlew assembleDebug
```

The APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`
