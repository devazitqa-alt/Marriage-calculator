import os
import zipfile

def make_zip():
    source_dir = 'flutter_marriage_app'
    output_filename = 'public/flutter_marriage_app.zip'

    os.makedirs('public', exist_ok=True)

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, start='.')
                zipf.write(file_path, arcname)
                print(f"Added: {arcname}")

    print(f"Successfully created {output_filename} ({os.path.getsize(output_filename)} bytes)")

if __name__ == '__main__':
    make_zip()
