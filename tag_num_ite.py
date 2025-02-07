from argparse import ArgumentParser
from pathlib import Path

import eyed3

parser = ArgumentParser()
parser.add_argument('input_path', type=Path, help='The input file or directory')

args = parser.parse_args()

input_path: Path = args.input_path

if input_path.is_dir():
    input_files = input_path.glob('*.mp3')
elif input_path.suffix == '.mp3':
    input_files = [input_path]
else:
    raise Exception('.mp3 expected!')

for i, input_file in enumerate(sorted(input_files)):
    file = eyed3.load(input_file)
    if file is None or file.tag is None:
        raise Exception('Failed load')

    file.tag.track_num = i + 1
    file.tag.disc_num = None

    file.tag.save()
