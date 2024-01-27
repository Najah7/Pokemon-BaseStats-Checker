import os

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import japanize_matplotlib
import numpy as np
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from pathlib import Path

# get full path of ../images/pikachu.png
current_directory = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_PATH = os.path.join(current_directory, 'images/pikachu.jpg')
OUTPUT_PATH = os.path.join(current_directory, 'graphs/')

print(IMAGE_PATH)

TITLE = 'ポケモン種族値チェッカー'
SUBTITLE = '～for Engneer～'

# NOTE: 画像の見栄えで大雑把に調整
POKEMON_TRANSPARENCY = 0.3
POKEMON_SIZE =  0.8
FILL_COLOR_TRANSPARENCY = 0.65


# HACK: pokemon.line_colorで扱いたい
# NOTE:下記の値はすべて変数、ポケモンに依存して変わる
# NOTE:これはピカチュウの場合
pokemon_name = 'ピカチュウ'
line_color = 'yellow'
fill_color = 'gold'

hp = 35
attack = 55
defense = 40
special_attack = 50
special_defense = 50
speed = 90

values = [hp, attack, defense, special_attack, special_defense, speed]
labels = ['HP', 'Attack', 'Defense', 'Special-Attack', 'Special-Defense', 'Speed']

# the size of spacing between the lines (in % of the radius)
angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()

# Render a graph (radar chart)
fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
ax.fill(angles, values, color='gold', alpha=FILL_COLOR_TRANSPARENCY)
ax.plot(angles, values, color='yellow', linewidth=2)

# Render pokemon image
img = plt.imread(IMAGE_PATH)
imagebox = OffsetImage(img, zoom=POKEMON_SIZE, alpha=POKEMON_TRANSPARENCY)
ab = AnnotationBbox(imagebox, (0.5, 0.5), frameon=False, xycoords='axes fraction', boxcoords="axes fraction")
ax.add_artist(ab)

# Set labels for the graph
ax.set_yticklabels([])
ax.set_xticks(angles)
ax.set_xticklabels(labels)

# Add texts
plt.text(0.5, 0.2, TITLE, ha='center', va='center', fontsize=16, transform=ax.transAxes)
plt.text(0.5, 0.155, SUBTITLE, ha='center', va='center', fontsize=12, transform=ax.transAxes)
plt.text(0.5, 0.11, f'あなたの種族値は{pokemon_name}型です', ha='center', va='center', fontsize=13, transform=ax.transAxes)

# plt.show()

plt.savefig(f'{OUTPUT_PATH}pikachu.png', pad_inches=0.0)