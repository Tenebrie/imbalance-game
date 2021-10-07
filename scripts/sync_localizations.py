#!/usr/bin/env python3

import re
import json
import argparse
import os
import sys

os.chdir(sys.path[0])

parser = argparse.ArgumentParser(description='Update and reformat localization files')
parser.add_argument('-F', '--ignore-flavor', action='store_true', dest='ignoreFlavor', help='if present, ignore .flavor strings')
parser.add_argument('-T', '--ignore-target', action='store_true', dest='ignoreTarget', help='if present, ignore .target strings')

args = parser.parse_args()

with open('../client/src/Pixi/locales/en.json', 'r', encoding='utf-8') as f:
	json_en_text = f.read()

with open('../client/src/Pixi/locales/ru.json', 'r', encoding='utf-8') as f:
	json_ru_text = f.read()

json_en = json.loads(json_en_text)
json_ru = json.loads(json_ru_text)

missingKeys = []
for originalKey, originalValue in json_en.items():
	if originalKey not in json_ru:
		missingKeys.append(originalKey)

addedLocalizations = {}
ignoredKeys = []
for index, ignoredKey in enumerate(missingKeys, start=0):
	print("Missing \033[0;32m{}\033[0m localization string(s)...".format(len(missingKeys) - index))
	print("Key: \033[0;33m{}\033[0m\nOriginal value: \033[0;36m{}\033[0m".format(ignoredKey, json_en[ignoredKey]))
	if ignoredKey.endswith('.flavor') and args.ignoreFlavor:
		print('\033[0;34mSkipping .flavor string\033[0m\n')
		ignoredKeys.append(ignoredKey)
		continue
	if ignoredKey.endswith('.target') and args.ignoreTarget:
		print('\033[0;34mSkipping .target string\033[0m\n')
		ignoredKeys.append(ignoredKey)
		continue
	userInput = input("> \033[0;36m").replace("\\n", "[NEWLINE]")
	print('\033[0m')
	if len(userInput) > 0:
		addedLocalizations[ignoredKey] = userInput
	else:
		ignoredKeys.append(ignoredKey)

formattedJson = json_en_text
allLocalizations = {**json_ru, **addedLocalizations}
for localizedKey, localizedValue in allLocalizations.items():
	for line in json_en_text.split("\n"):
		if localizedKey in line:
			escapedValue = re.sub("\n", "[NEWLINE]", localizedValue)
			formattedJson = re.sub("\"" + localizedKey + "\":\\s?.+", "\"" + localizedKey + "\": \"" + escapedValue + "\",", formattedJson)

for ignoredKey in ignoredKeys:
	for line in formattedJson.split("\n"):
		if ignoredKey in line:
			formattedJson = formattedJson.replace(line, "")

unescapedJson = formattedJson.replace("[NEWLINE]", "\\n")
unescapedJson = re.sub(",\n}$", "\n}", unescapedJson)
finalJson = bytes(unescapedJson, 'utf-8').decode('utf-8', 'ignore')

with open('../client/src/Pixi/locales/ru.json', 'w', encoding='utf-8') as f:
	f.write(finalJson)

print('\033[0;33mLocalization file updated!\033[0m')

# Encode the Python dictionary into a JSON string.
# new_json_string = json.dumps(apod_dict, indent=4)
# print(new_json_string)
