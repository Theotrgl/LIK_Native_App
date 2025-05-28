import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    Animated,
    PanResponder,
    Easing,
    SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_CROP_SIZE = 100;
const CROP_HANDLE_SIZE = 40;
const CROP_BORDER_WIDTH = 2;
const CROP_CORNER_SIZE = 25;
const CROP_EDGE_THICKNESS = 25;
const INTERACTION_AREA = CROP_EDGE_THICKNESS * 1.5;

const ROTATE_OPTIONS = [
    { degrees: -90, icon: 'rotate-ccw', label: 'Ke Kiri' },
    { degrees: 90, icon: 'rotate-cw', label: 'Ke Kanan' },
];

const TOOLS = [
    { key: 'rotate', name: 'Putar', icon: 'rotate-cw' },
    { key: 'crop', name: 'Potong', icon: 'crop' },
];

const compressAndFormatImage = async (uri) => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
                compress: 0.7,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );
        return result.uri;
    } catch (error) {
        console.error('Error kompresi gambar:', error);
        return uri;
    }
};

const ImageEditorModal = ({
    visible,
    onClose,
    imageUri,
    onSave,
    onError,
}) => {
    const [currentImage, setCurrentImage] = useState(null);
    const [activeTool, setActiveTool] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cropData, setCropData] = useState({
        originX: 0,
        originY: 0,
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.6
    });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
    const [interactionType, setInteractionType] = useState(null);
    const [initialTouch, setInitialTouch] = useState({ x: 0, y: 0 });
    const [initialCropData, setInitialCropData] = useState(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                if (activeTool !== 'crop') return;

                const { locationX, locationY } = evt.nativeEvent;
                setInitialTouch({ x: locationX, y: locationY });
                setInitialCropData(cropData);

                const { originX, originY, width, height } = cropData;

                // Check if touch is near the edges or corners
                const isLeftEdge = Math.abs(locationX - originX) < INTERACTION_AREA;
                const isRightEdge = Math.abs(locationX - (originX + width)) < INTERACTION_AREA;
                const isTopEdge = Math.abs(locationY - originY) < INTERACTION_AREA;
                const isBottomEdge = Math.abs(locationY - (originY + height)) < INTERACTION_AREA;

                if (isLeftEdge && isTopEdge) {
                    setInteractionType('top-left');
                } else if (isRightEdge && isTopEdge) {
                    setInteractionType('top-right');
                } else if (isLeftEdge && isBottomEdge) {
                    setInteractionType('bottom-left');
                } else if (isRightEdge && isBottomEdge) {
                    setInteractionType('bottom-right');
                } else if (isLeftEdge) {
                    setInteractionType('left');
                } else if (isRightEdge) {
                    setInteractionType('right');
                } else if (isTopEdge) {
                    setInteractionType('top');
                } else if (isBottomEdge) {
                    setInteractionType('bottom');
                } else if (
                    locationX > originX &&
                    locationX < originX + width &&
                    locationY > originY &&
                    locationY < originY + height
                ) {
                    setInteractionType('move');
                } else {
                    setInteractionType(null);
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                if (activeTool !== 'crop' || !interactionType) return;

                const { moveX, moveY } = gestureState;
                const dx = moveX - initialTouch.x;
                const dy = moveY - initialTouch.y;

                const { originX, originY, width, height } = initialCropData;

                let newCropData = { ...initialCropData };

                switch (interactionType) {
                    case 'move':
                        newCropData.originX = Math.max(0, Math.min(SCREEN_WIDTH - width, originX + dx));
                        newCropData.originY = Math.max(0, Math.min(displayDimensions.height - height, originY + dy));
                        break;
                    case 'left':
                        newCropData.originX = Math.max(0, Math.min(originX + width - MIN_CROP_SIZE, originX + dx));
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(originX + width, width - dx));
                        break;
                    case 'right':
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(SCREEN_WIDTH - originX, width + dx));
                        break;
                    case 'top':
                        newCropData.originY = Math.max(0, Math.min(originY + height - MIN_CROP_SIZE, originY + dy));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(originY + height, height - dy));
                        break;
                    case 'bottom':
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(displayDimensions.height - originY, height + dy));
                        break;
                    case 'top-left':
                        newCropData.originX = Math.max(0, Math.min(originX + width - MIN_CROP_SIZE, originX + dx));
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(originX + width, width - dx));
                        newCropData.originY = Math.max(0, Math.min(originY + height - MIN_CROP_SIZE, originY + dy));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(originY + height, height - dy));
                        break;
                    case 'top-right':
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(SCREEN_WIDTH - originX, width + dx));
                        newCropData.originY = Math.max(0, Math.min(originY + height - MIN_CROP_SIZE, originY + dy));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(originY + height, height - dy));
                        break;
                    case 'bottom-left':
                        newCropData.originX = Math.max(0, Math.min(originX + width - MIN_CROP_SIZE, originX + dx));
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(originX + width, width - dx));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(displayDimensions.height - originY, height + dy));
                        break;
                    case 'bottom-right':
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(SCREEN_WIDTH - originX, width + dx));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(displayDimensions.height - originY, height + dy));
                        break;
                    default:
                        break;
                }

                setCropData(newCropData);
            },
            onPanResponderRelease: () => {
                setInteractionType(null);
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible]);

    useEffect(() => {
        if (imageUri) {
            setCurrentImage(imageUri);
            Image.getSize(imageUri, (width, height) => {
                setImageDimensions({ width, height });
                const displayHeight = (SCREEN_WIDTH * height) / width;
                setDisplayDimensions({
                    width: SCREEN_WIDTH,
                    height: displayHeight
                });
                const scaleX = width / SCREEN_WIDTH;
                const scaleY = height / displayHeight;
                setScaleFactor({ x: scaleX, y: scaleY });
                const initialWidth = Math.min(SCREEN_WIDTH * 0.9, SCREEN_WIDTH);
                const initialHeight = Math.min(displayHeight * 0.7, displayHeight);

                const initialCropData = {
                    originX: (SCREEN_WIDTH - initialWidth) / 2,
                    originY: (displayHeight - initialHeight) / 2,
                    width: initialWidth,
                    height: initialHeight
                };

                setCropData(initialCropData);
            }, (error) => {
                console.error('Error getting image size:', error);
                handleError('Gagal memuat gambar', error);
            });
        }
    }, [imageUri]);

    const handleRotate = async (degrees) => {
        if (!currentImage) return;
        setIsProcessing(true);
        try {
            const rotatedImage = await ImageManipulator.manipulateAsync(
                currentImage,
                [{ rotate: degrees }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
            setCurrentImage(rotatedImage.uri);
            Image.getSize(rotatedImage.uri, (width, height) => {
                setImageDimensions({ width, height });
                const displayHeight = (SCREEN_WIDTH * height) / width;
                setDisplayDimensions({
                    width: SCREEN_WIDTH,
                    height: displayHeight
                });
                setScaleFactor({
                    x: width / SCREEN_WIDTH,
                    y: height / displayHeight
                });
                const newWidth = Math.min(SCREEN_WIDTH * 0.9, SCREEN_WIDTH);
                const newHeight = Math.min(displayHeight * 0.7, displayHeight);

                const newCropData = {
                    originX: (SCREEN_WIDTH - newWidth) / 2,
                    originY: (displayHeight - newHeight) / 2,
                    width: newWidth,
                    height: newHeight
                };

                setCropData(newCropData);
            });
        } catch (error) {
            console.error('Error rotating:', error);
            handleError('Gagal memutar gambar', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCrop = async () => {
        if (!currentImage) return;
        setIsProcessing(true);
        try {
            // Convert display coordinates to image coordinates
            const originX = Math.round(cropData.originX * scaleFactor.x);
            const originY = Math.round(cropData.originY * scaleFactor.y);
            const width = Math.round(cropData.width * scaleFactor.x);
            const height = Math.round(cropData.height * scaleFactor.y);

            const croppedImage = await ImageManipulator.manipulateAsync(
                currentImage,
                [{
                    crop: {
                        originX,
                        originY,
                        width,
                        height
                    }
                }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );

            setCurrentImage(croppedImage.uri);
            setActiveTool(null);

            // Update dimensions after crop
            Image.getSize(croppedImage.uri, (width, height) => {
                setImageDimensions({ width, height });
                const displayHeight = (SCREEN_WIDTH * height) / width;
                setDisplayDimensions({
                    width: SCREEN_WIDTH,
                    height: displayHeight
                });
                setScaleFactor({
                    x: width / SCREEN_WIDTH,
                    y: height / displayHeight
                });

                // Reset crop area to full image
                setCropData({
                    originX: 0,
                    originY: 0,
                    width: SCREEN_WIDTH,
                    height: displayHeight
                });
            });
        } catch (error) {
            console.error('Error cropping:', error);
            handleError('Gagal memotong gambar', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleError = (message, error) => {
        if (onError) {
            onError(error || new Error(message));
        } else {
            Alert.alert("Terjadi Kesalahan", message);
        }
    };

    const handleSave = async () => {
        if (!currentImage) {
            Alert.alert("Kesalahan", "Tidak ada gambar untuk disimpan");
            return;
        }
        try {
            const compressedUri = await compressAndFormatImage(currentImage);
            onSave(compressedUri);
            onClose();
        } catch (error) {
            console.error('Error saving:', error);
            handleError('Gagal menyimpan gambar', error);
        }
    };

    const renderCropOverlay = () => {
        const { originX, originY, width, height } = cropData;

        return (
            <View
                style={styles.cropOverlay}
                {...panResponder.panHandlers}
                pointerEvents="box-only"
            >
                <View style={[styles.cropArea, {
                    left: originX,
                    top: originY,
                    width,
                    height
                }]}>
                    {/* Edges */}
                    <View style={[styles.cropEdge, styles.cropEdgeTop]} />
                    <View style={[styles.cropEdge, styles.cropEdgeBottom]} />
                    <View style={[styles.cropEdge, styles.cropEdgeLeft]} />
                    <View style={[styles.cropEdge, styles.cropEdgeRight]} />

                    {/* Corners */}
                    <View style={[styles.cropCorner, styles.cropCornerTL]} />
                    <View style={[styles.cropCorner, styles.cropCornerTR]} />
                    <View style={[styles.cropCorner, styles.cropCornerBL]} />
                    <View style={[styles.cropCorner, styles.cropCornerBR]} />
                </View>
            </View>
        );
    };

    const renderToolContent = () => {
        if (isProcessing) {
            return (
                <View style={styles.toolContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.toolTitle}>Sedang memproses...</Text>
                </View>
            );
        }

        switch (activeTool) {
            case 'rotate':
                return (
                    <Animated.View style={[styles.toolContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.toolTitle}>Putar Gambar</Text>
                        <View style={styles.transformActions}>
                            {ROTATE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.degrees}
                                    style={styles.transformButton}
                                    onPress={() => handleRotate(option.degrees)}
                                >
                                    <Feather name={option.icon} size={30} color="#4A90E2" />
                                    <Text style={styles.transformButtonText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setActiveTool(null)}
                            >
                                <Text style={styles.secondaryButtonText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => setActiveTool(null)}
                            >
                                <Text style={styles.primaryButtonText}>Selesai</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                );
            case 'crop':
                return (
                    <Animated.View style={[styles.toolContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.toolTitle}>Potong Gambar</Text>
                        <Text style={styles.instructionText}>
                            Geser tepian untuk mengubah ukuran atau geser tengah untuk memindahkan area potong
                        </Text>
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setActiveTool(null)}
                            >
                                <Text style={styles.secondaryButtonText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleCrop}
                            >
                                <Text style={styles.primaryButtonText}>Potong</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    if (!currentImage) {
        return (
            <Modal visible={visible} onRequestClose={onClose} transparent>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Tidak ada gambar yang tersedia</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
                        <Text style={styles.primaryButtonText}>Tutup</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
                <GestureHandlerRootView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={onClose}
                            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                        >
                            <Feather name="x" size={28} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Gambar</Text>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleSave}
                            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                        >
                            <Feather name="check" size={28} color="#4A90E2" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: currentImage }}
                            style={{
                                width: displayDimensions.width,
                                height: displayDimensions.height
                            }}
                            resizeMode="contain"
                        />
                        {activeTool === 'crop' && renderCropOverlay()}
                    </View>

                    {renderToolContent()}

                    {!activeTool && !isProcessing && (
                        <Animated.View style={[styles.toolbar, { opacity: fadeAnim }]}>
                            {TOOLS.map((tool) => (
                                <TouchableOpacity
                                    key={tool.key}
                                    style={styles.toolButton}
                                    onPress={() => setActiveTool(tool.key)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.toolIconContainer}>
                                        <Feather name={tool.icon} size={28} color="#4A90E2" />
                                    </View>
                                    <Text style={styles.toolButtonText}>{tool.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    )}
                </GestureHandlerRootView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 20,
    },
    emptyText: {
        color: 'white',
        fontSize: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 10, // Reduced paddingTop
        backgroundColor: '#1E1E1E',
    },
    headerButton: {
        padding: 12,
        zIndex: 1, // Ensure buttons are always tappable
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    cropOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropArea: {
        position: 'absolute',
        borderWidth: CROP_BORDER_WIDTH,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    cropCorner: {
        position: 'absolute',
        width: CROP_CORNER_SIZE,
        height: CROP_CORNER_SIZE,
        backgroundColor: 'transparent',
        borderColor: '#4A90E2',
    },
    cropCornerTL: {
        top: -CROP_BORDER_WIDTH,
        left: -CROP_BORDER_WIDTH,
        borderLeftWidth: 4,
        borderTopWidth: 4,
    },
    cropCornerTR: {
        top: -CROP_BORDER_WIDTH,
        right: -CROP_BORDER_WIDTH,
        borderRightWidth: 4,
        borderTopWidth: 4,
    },
    cropCornerBL: {
        bottom: -CROP_BORDER_WIDTH,
        left: -CROP_BORDER_WIDTH,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
    },
    cropCornerBR: {
        bottom: -CROP_BORDER_WIDTH,
        right: -CROP_BORDER_WIDTH,
        borderRightWidth: 4,
        borderBottomWidth: 4,
    },
    cropEdge: {
        position: 'absolute',
        backgroundColor: 'rgba(74, 144, 226, 0.3)',
    },
    cropEdgeTop: {
        top: -CROP_BORDER_WIDTH,
        left: 0,
        right: 0,
        height: INTERACTION_AREA,
    },
    cropEdgeBottom: {
        bottom: -CROP_BORDER_WIDTH,
        left: 0,
        right: 0,
        height: INTERACTION_AREA,
    },
    cropEdgeLeft: {
        left: -CROP_BORDER_WIDTH,
        top: 0,
        bottom: 0,
        width: INTERACTION_AREA,
    },
    cropEdgeRight: {
        right: -CROP_BORDER_WIDTH,
        top: 0,
        bottom: 0,
        width: INTERACTION_AREA,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingBottom: 30,
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    toolButton: {
        alignItems: 'center',
        width: '40%',
    },
    toolIconContainer: {
        backgroundColor: '#252525',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    toolButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    toolContainer: {
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    toolTitle: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    instructionText: {
        color: '#AAA',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    transformActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    transformButton: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#252525',
        width: '48%',
    },
    transformButtonText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    primaryButton: {
        flex: 1,
        padding: 18,
        borderRadius: 10,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        marginLeft: 10,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        padding: 18,
        borderRadius: 10,
        backgroundColor: '#252525',
        alignItems: 'center',
        marginRight: 10,
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ImageEditorModal;