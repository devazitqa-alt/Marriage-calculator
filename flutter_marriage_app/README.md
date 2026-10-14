# Marriage Point Calculator - Flutter Android Mobile App

This is the complete Flutter codebase for the Nepali Marriage Card Game Point Calculator, built with Dart and Flutter for Android (and iOS).

## How to Build the Android APK:

1. **Prerequisites**:
   - Ensure you have [Flutter SDK](https://flutter.dev/docs/get-started/install) installed on your computer.
   - Android Studio with Android SDK.

2. **Setup Dependencies**:
   ```bash
   cd flutter_marriage_app
   flutter pub get
   ```

3. **Build the APK**:
   ```bash
   flutter build apk --release
   ```
   The generated APK will be at:
   `build/app/outputs/flutter-apk/app-release.apk`

4. **Install directly on your connected Android phone**:
   ```bash
   flutter run --release
   ```

## Key Features:
- Exact Nepali Marriage scorekeeping table
- Murder / Kidnap rule calculation
- Auditable ledger & pairwise maal transfers
- Callbreak support
