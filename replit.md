# Discord Connect 4 Bot

## Overview

This is a Discord bot that implements the classic Connect 4 (Puissance 4) game directly within Discord servers. The bot allows Discord users to play interactive Connect 4 matches against each other using slash commands and button interactions. Players take turns dropping colored pieces into a 7-column, 6-row grid with the goal of connecting four pieces in a row horizontally, vertically, or diagonally.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v14**: Modern Discord API wrapper providing comprehensive bot functionality
- **Event-driven Architecture**: Uses Discord.js client events and interaction handlers
- **Slash Commands**: Modern Discord command interface for user interactions
- **Message Components**: Interactive buttons for game moves and controls

### Game Logic Architecture
- **Object-Oriented Game State**: `Puissance4Game` class encapsulates all game logic and state
- **In-Memory Game Storage**: Uses JavaScript `Map` and `Set` for temporary game session storage
- **Turn-based Logic**: Alternating player system with move validation
- **Win Detection Algorithm**: Multi-directional checking for horizontal, vertical, and diagonal connections

### State Management
- **Game Sessions**: `puissance4Games` Map stores active game instances by unique identifiers
- **Player Tracking**: `playerInGame` Set prevents users from joining multiple simultaneous games
- **Session Lifecycle**: Games are created on command initiation and cleaned up on completion

### User Interface
- **Visual Board Representation**: Uses Discord emojis (🔴, 🟡, ⚪) to render the game board
- **Interactive Buttons**: Column selection through Discord button components
- **Rich Embeds**: Formatted game status messages with embedded game boards
- **Real-time Updates**: Board state updates immediately after each move

### Game Flow
- **Command Registration**: Slash commands registered via Discord API
- **Game Initialization**: Two-player setup with invitation system
- **Move Processing**: Button interactions trigger game state updates
- **Win Conditions**: Automatic detection of wins, draws, and game completion

## External Dependencies

### Core Dependencies
- **Discord.js**: Primary Discord API integration for bot functionality, slash commands, and message interactions
- **dotenv**: Environment variable management for secure token storage

### Discord API Integration
- **Gateway Intents**: Configured for guild-based interactions only
- **REST API**: Used for slash command registration and management
- **WebSocket Gateway**: Real-time event handling for user interactions

### Runtime Environment
- **Node.js**: JavaScript runtime environment
- **NPM Package Management**: Dependency management and project structure