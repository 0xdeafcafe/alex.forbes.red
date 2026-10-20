# Windows XP desktop imagery

Bliss: original Windows XP Bliss.bmp by Charles O'Rear / Microsoft,
converted to JPEG using macOS sips (quality 95).
https://github.com/bartekl1/windows-ui-assets/blob/main/Wallpapers/Windows%20XP/Desktop/Bliss.bmp

Shell icons: Microsoft Windows XP shell32 icon images, converted from ICO
using macOS sips. Only icon image files were downloaded, not the DLL.
https://github.com/bartekl1/windows-ui-assets/tree/main/Icons/Windows%20XP/ico/shell32.dll
- folder.png: ICON4_1.ico, explicitly extracted 32×32 32-bit frame (the 96px frame is a generic folder)
- application.png: ICON3_1.ico, 32×32 16-colour frame decoded with its
  transparency mask (the generic XP program icon; the archive has no 48px
  frame for it, and the earlier sips conversion came out almost fully transparent)
- document.png: ICON152_1.ico, 48×48 32-bit frame (text document)
- pictures.png: ICON236_1.ico, 48×48 32-bit frame (My Pictures folder)
- music.png: ICON237_1.ico, 48×48 32-bit frame (My Music folder)
- computer.png: ICON16_1.ico

application, document, pictures and music were decoded from the ICO frames
with a short Python standard-library script, without resizing or recolouring.

Windows flag: https://github.com/homarr-labs/dashboard-icons/blob/main/png/windows-xp.png

Original imagery remains the property of its respective owners. Fonts are
selected from locally installed Tahoma / Trebuchet MS; no font files are bundled.

Internet Explorer: ICON512_1.ico, original 48×48 32-bit frame from the same
XP shell32 icon archive above, decoded with its alpha channel.

Desktop wallpaper picker: original XP JPEG backgrounds (Ascent, Autumn, Azul,
Crystal, Follow, Friend, Home, Moon flower, Peace, Power, Purple flower, Radiance,
Red moon desert, Ripple, Stonehenge, Tulips, Vortec space, Wind, Windows XP),
retained unmodified under wallpapers/. Source archive:
https://github.com/bartekl1/windows-ui-assets/tree/main/Wallpapers/Windows%20XP/Desktop
These are original Microsoft-distributed wallpapers; no ownership or new licence
is claimed. The user's photographs remain in the existing images/photos collection.
