from argparse import ArgumentParser
from pathlib import Path

import re
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

pattern = re.compile(r'(\d)-(\d+)\.\s(.+)\.mp3')

for input_file in input_files:
    match = pattern.search(input_file.name)
    if match is None:
        raise Exception('Unexpected filename format', input_file.name)

    file = eyed3.load(input_file)
    if file is None or file.tag is None:
        raise Exception('Failed load')

    file.tag.disc_num = match.group(1)
    file.tag.track_num = match.group(2)
    file.tag.title = match.group(3)

    file.tag.save()
