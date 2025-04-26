'use client'
import React, { useState, useRef, useEffect } from 'react';
import * as Phaser from 'phaser';
import { useRouter } from 'next/navigation';
import SnakeGame from './SnakeGame';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const AvatarManager = ({ roomId, user, members, onAvatarMove }) => {
    const gameRef = useRef(null);
    const [gameInstance, setGameInstance] = useState(null);
    const [inCodingZone, setInCodingZone] = useState(false);
    const [inGameZone, setInGameZone] = useState(false);
    const [inStore, setInStore] = useState(false);
    const [defaultAvatar, setDefaultAvatar] = useState(null);
    const router = useRouter();
    const { user: authUser } = useAuth();

    useEffect(() => {
        const fetchDefaultAvatar = async () => {
            if (!authUser) return;
            
            try {
                const response = await axios.get('http://localhost:3001/api/user/default-avatar', {
                    headers: {
                        Authorization: `Bearer ${authUser.token}`
                    }
                });
                if (response.data.success) {
                    setDefaultAvatar(response.data.data);
                    console.log(defaultAvatar);
                    console.log(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching default avatar:', error);
            }
        };

        fetchDefaultAvatar();
    }, [authUser]);

    useEffect(() => {
        if (!gameRef.current) return;

        const config = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: '100%',
            height: '100%',
            scene: {
                preload: preload,
                create: create,
                update: update
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };

        const game = new Phaser.Game(config);
        setGameInstance(game);

        function preload() {
            if (defaultAvatar) {
                this.load.image('avatar', defaultAvatar.imageUrl);
            } else {
                this.load.image('avatar', '/avatar.svg');
            }
            this.load.image('background', '/room-background.svg');
            this.load.image('codingZone', '/coding-zone.svg');
            this.load.image('gameZone', '/game-zone.svg');
            this.load.image('wallTile', '/wall-tile.png');
            this.load.image('grass', '/grass.png');
            this.load.image('waterTile', '/water-tile.png');
            this.load.image('tree', '/tree.png');
            this.load.image('windowTile', '/window-tile.png');
            this.load.image('wayToCodingZone', '/way_to_coding_zone.png');
            this.load.image('wayToGamingZone', '/way_to_gaming_zone.png');
            this.load.image('store','/store.svg');
        }   

        let player;
        let cursors;
        let otherPlayers = {};
        let codingZone;
        let gameZone;
        let store;
        let enterKey;
        let isPlayerInCodingZone = false;
        let isPlayerInGameZone = false;
        let isPlayerInStore = false;

        function create() {
            const bg = this.add.image(0, 0, 'background');
            bg.setOrigin(0,0);
            bg.setDisplaySize(gameRef.current.clientWidth, gameRef.current.clientHeight-100);
            
            const boxWidth = gameRef.current.clientWidth;
            const boxHeight = gameRef.current.clientHeight;

            const containWidth = gameRef.current.clientWidth;
            const containHeight = gameRef.current.clientHeight - 100;
            this.physics.world.setBounds(0, 0, containWidth, containHeight);

            codingZone = this.add.image(1150, 150, 'codingZone').setScale(0.4);
            codingZone.setInteractive();
            this.physics.add.existing(codingZone, true);
            this.add.text(1112, 180, 'Coding Zone', { 
                fontFamily: 'Arial', 
                fontSize: 14, 
                color: '#ffffff',
                align: 'center'
            });

            const positions = [{x:160,y:160}];

            positions.forEach((pos)=>{
                gameZone = this.add.image(pos.x,pos.y, 'gameZone').setScale(0.5);
                gameZone.setInteractive();
                this.physics.add.existing(gameZone, true);
            });
            
            this.add.text(123, 200, 'Game Zone', { 
                fontFamily: 'Arial', 
                fontSize: 14, 
                color: '#ffffff',
                align: 'center'
            });

            store = this.add.image(boxWidth * 0.2, boxHeight * 0.7, 'store').setScale(0.8);
            store.setInteractive();
            this.physics.add.existing(store, true);
            this.add.text(boxWidth * 0.189, boxHeight * 0.74, 'Store', { 
                fontFamily: 'Arial', 
                fontSize: 14, 
                color: '#ffffff',
                align: 'center'
            });

            player = this.physics.add.sprite(400, 300, 'avatar');
            player.setScale(0.45);
            player.setCollideWorldBounds(true);

            const wallGraphics = this.add.graphics({ fillStyle: { color: 0x8B4513 } });

            const wallRects = [
                new Phaser.Geom.Rectangle(0, 0, boxWidth, 20),
                new Phaser.Geom.Rectangle(0, boxHeight - 130, boxWidth, 20),
                new Phaser.Geom.Rectangle(0, 0, 20, boxHeight),
                new Phaser.Geom.Rectangle(boxWidth - 20, 0, 20, boxHeight),
                new Phaser.Geom.Rectangle(boxWidth*0.1965, 0, 20, boxHeight * 0.4),
                new Phaser.Geom.Rectangle(0, boxHeight * 0.4, boxHeight * 0.15, 20),
                new Phaser.Geom.Rectangle(boxWidth * 0.15, boxHeight * 0.4, boxWidth * 0.06, 20),
                new Phaser.Geom.Rectangle(boxWidth * 0.65, boxHeight * 0.3, boxWidth * 0.05, 20),
                new Phaser.Geom.Rectangle(boxWidth * 0.7632, boxHeight * 0.3, boxWidth * 0.1, 20),
                new Phaser.Geom.Rectangle(boxWidth * 0.65, boxHeight * 0, 20, boxHeight * 0.3),
                new Phaser.Geom.Rectangle(boxWidth * 0.85, boxHeight * 0, 20, boxHeight * 0.3),
                new Phaser.Geom.Rectangle(boxWidth * 0.05, boxHeight * 0.6, boxWidth * 0.1, 20),
                new Phaser.Geom.Rectangle(boxWidth * 0.25, boxHeight * 0.6, boxWidth * 0.1, 20),
                new Phaser.Geom.Rectangle(boxWidth * 0.05, boxHeight * 0.6, 20, boxHeight * 0.25),
                new Phaser.Geom.Rectangle(boxWidth * 0.35, boxHeight * 0.6, 20, boxHeight * 0.25),
            ];

            wallRects.forEach(rect => {
                const wall = this.add.tileSprite(
                    rect.x + rect.width / 2,
                    rect.y + rect.height / 2,
                    rect.width,
                    rect.height,
                    'wallTile'
                );
                this.physics.add.existing(wall, true);
                this.physics.add.collider(player, wall);
            });

            const waterArea = this.add.tileSprite(
                boxWidth * 0.8,
                boxHeight * 0.73,
                boxWidth * 0.3,
                boxHeight * 0.2,
                'waterTile'
            );
            this.physics.add.existing(waterArea, true);
            this.physics.add.collider(player, waterArea);
            
            this.add.image(boxWidth*0.65, boxHeight*0.55, 'tree').setScale(1);
            this.add.image(boxWidth*0.35, boxHeight*0.25, 'tree').setScale(1);
            this.add.image(boxWidth*0.55, boxHeight*0.15, 'tree').setScale(1);
            this.add.image(boxWidth*0.06, boxHeight*0.413, 'windowTile').setScale(0.7);
            this.add.image(boxWidth*0.06, boxHeight*0.413, 'windowTile').setScale(0.7);
            
            this.add.image(boxWidth*0.5, boxHeight * 0.4, 'wayToCodingZone').setScale(2);
            this.add.image(boxWidth*0.4, boxHeight * 0.5, 'wayToGamingZone').setScale(2);

            cursors = this.input.keyboard.createCursorKeys();
            enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

            members.forEach(member => {
                if (member.userId !== user.id) {
                    const otherPlayer = this.physics.add.sprite(
                        Phaser.Math.Between(0, 800), 
                        Phaser.Math.Between(0, 600), 
                        'avatar'
                    );
                    otherPlayers[member.userId] = otherPlayer;
                }
            });

            this.physics.add.overlap(player, codingZone, () => {
                if (!isPlayerInCodingZone) {
                    isPlayerInCodingZone = true;
                    setInCodingZone(true);
                }
            }, null, this);

            this.physics.add.overlap(player, gameZone, () => {
                if (!isPlayerInGameZone) {
                    isPlayerInGameZone = true;
                    setInGameZone(true);
                }
            }, null, this);

            this.physics.add.overlap(player, store, () => {
                if (!isPlayerInStore) {
                    isPlayerInStore = true;
                    setInStore(true);
                }
            }, null, this);
        }

        function update() {
            if (!player || !cursors) return;

            const touchingCodingZone = this.physics.overlap(player, codingZone);
            if (isPlayerInCodingZone && !touchingCodingZone) {
                isPlayerInCodingZone = false;
                setInCodingZone(false);
            }

            const touchingGameZone = this.physics.overlap(player, gameZone);
            if (isPlayerInGameZone && !touchingGameZone) {
                isPlayerInGameZone = false;
                setInGameZone(false);
            }

            const touchingStore = this.physics.overlap(player, store);
            if (isPlayerInStore && !touchingStore) {
                isPlayerInStore = false;
                setInStore(false);
            }

            if (isPlayerInCodingZone && Phaser.Input.Keyboard.JustDown(enterKey)) {
                router.push(`/code/${roomId}`);
            }

            if (isPlayerInGameZone && Phaser.Input.Keyboard.JustDown(enterKey)) {
                router.push('/game');
            }

            if (isPlayerInStore && Phaser.Input.Keyboard.JustDown(enterKey)) {
                router.push(`/store`);
            }

            const speed = 300;
            let direction = 'idle';

            if (cursors.left.isDown) {
                player.setVelocityX(-speed);
                direction = 'left';
            } else if (cursors.right.isDown) {
                player.setVelocityX(speed);
                direction = 'right';
            } else {
                player.setVelocityX(0);
            }

            if (cursors.up.isDown) {
                player.setVelocityY(-speed);
                direction = 'up';
            } else if (cursors.down.isDown) {
                player.setVelocityY(speed);
                direction = 'down';
            } else {
                player.setVelocityY(0);
            }

            if (direction !== 'idle') {
                onAvatarMove(player.x, player.y, direction);
            }
        }

        return () => {
            game.destroy(true);
        };
    }, [roomId, user, members, router, defaultAvatar]);

    return (
        <div className="h-full relative">
            <h3 className="text-xl text-center font-bold my-3 text-[#0DF2FF]">Room</h3>
            <div className="relative overflow-clip h-[86vh] rounded-lg w-[99%] mx-auto">
                <div ref={gameRef} className="w-full bg-[#0A2342] rounded-lg"></div>
                {inCodingZone && (
                    <div className="absolute bottom-2 left-0 right-0 text-center bg-black bg-opacity-70 p-2 rounded mx-auto max-w-xs">
                        <p className="text-white text-sm">Press Enter to open the code editor</p>
                    </div>
                )}
                {inGameZone && (
                    <div className="absolute bottom-4 left-0 right-0 text-center bg-black bg-opacity-70 p-2 rounded mx-auto max-w-xs">
                        <p className="text-white text-sm">Press Enter to open the game</p>
                    </div>
                )}
                {inStore && (
                    <div className="absolute bottom-6 left-0 right-0 text-center bg-black bg-opacity-70 p-2 rounded mx-auto max-w-xs">
                        <p className="text-white text-sm">Press Enter to open the store</p>
                    </div>
                )}
            </div>
            <div className="mt-4">
                {members.map(member => (
                    <div 
                        key={member.userId} 
                        className="flex items-center space-x-2 mb-2"
                    >
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: member.avatar?.color || '#3498db' }}
                        >
                            {member.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>{member.name || 'Unknown User'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvatarManager;