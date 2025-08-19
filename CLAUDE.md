# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dance element combination generator** - a single-page web application that creates random combinations of dance moves. The project is designed to help dancers and choreographers generate creative dance sequences.

**Key Features:**
- Generates random combinations of dance elements from a configurable pool
- Supports custom XML data files for dance moves
- Tracks used combinations to avoid duplicates
- Responsive web design with animated UI elements
- Remote XML data loading capability

## Architecture

### File Structure
- `index.html` - Complete single-page application with embedded CSS and JavaScript
- `freestyle5.0.xml` - Dance elements data file containing 268+ dance moves
- `CNAME` - GitHub Pages domain configuration (dance.joyinai.net)
- `README.md` - Basic project description

### Application Architecture
The application is entirely self-contained in `index.html` with three main sections:

1. **HTML Structure** (lines 1-305):
   - Header with title and description
   - Controls section with input fields and file upload
   - Results area for displaying generated combinations

2. **CSS Styling** (lines 8-264):
   - Responsive design with gradient backgrounds
   - Animated elements with keyframe animations
   - Mobile-responsive breakpoints at 768px

3. **JavaScript Logic** (lines 307-580):
   - `elements[]` array storing dance move names
   - `usedCombinations` Set to track generated combinations
   - XML parsing for custom data files
   - Random combination generation algorithms
   - Remote XML loading from dance.joyinai.net

### Key Functions
- `loadXMLFile(event)` - Handles local XML file uploads
- `generateCombination()` - Creates random dance move combinations
- `getRandomCombination(arr, count)` - Fisher-Yates shuffle algorithm
- `loadRemoteXML()` - Fetches default dance data from remote server
- `displayCombination(combination)` - Renders animated combination UI

### Data Format
The XML data structure uses simple `<element>` tags within a `<danceElements>` root:
```xml
<danceElements>
    <element>ALB</element>
    <element>arm wave手臂波浪</element>
    <!-- ... more elements ... -->
</danceElements>
```

## Development Notes

### No Build Process
This is a static web application with no build system, package manager, or dependencies. Changes can be made directly to `index.html`.

### Testing
- Open `index.html` directly in a browser
- Test with different XML files to verify parsing
- Verify responsive design on mobile devices
- Check remote XML loading functionality

### Deployment
The project is configured for GitHub Pages deployment:
- Domain: dance.joyinai.net (configured in CNAME)
- Static hosting - no server-side processing required

### XML Data Management
- Default elements are hardcoded in JavaScript
- Custom XML files can be uploaded via file input
- Remote XML loading from https://dance.joyinai.net/freestyle5.0.xml
- Supports flexible XML parsing for different tag structures

### Key Algorithms
- **Combination Generation**: Uses Fisher-Yates shuffle to ensure randomness
- **Duplicate Prevention**: Maintains Set of used combinations (pipe-delimited strings)
- **Animation Timing**: Staggered element animations using CSS animation-delay