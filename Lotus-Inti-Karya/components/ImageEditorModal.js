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
    SafeAreaView,
    Platform,
    PanResponder,
    StatusBar,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_CROP_SIZE = 100;
const CROP_BORDER_WIDTH = 2;
const CROP_CORNER_SIZE = 25;
const CROP_EDGE_THICKNESS = 25;
const INTERACTION_AREA = CROP_EDGE_THICKNESS * 1.5;

const TOOLS = [
    { key: 'rotate', name: 'Putar', icon: 'rotate-cw' },
    { key: 'crop', name: 'Potong', icon: 'crop' },
    { key: 'reset', name: 'Reset', icon: 'refresh-ccw' },
];

const ROTATE_OPTIONS = [
    { degrees: -90, icon: 'rotate-ccw', label: 'Putar Kiri' },
    { degrees: 90, icon: 'rotate-cw', label: 'Putar Kanan' },
];

const ImageEditorModal = ({
    visible,
    onClose,
    imageUri,
    onSave,
    onError,
    closeButtonText = "Cancel",
    saveButtonText = "Save",
}) => {
    const [currentImage, setCurrentImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
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
    const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
    const [interactionType, setInteractionType] = useState(null);
    const [initialTouch, setInitialTouch] = useState({ x: 0, y: 0 });
    const [initialCropData, setInitialCropData] = useState(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                if (activeTool !== 'crop') return;

                const { locationX, locationY } = evt.nativeEvent;
                setInitialTouch({ x: locationX, y: locationY });
                setInitialCropData(cropData);

                const { originX, originY, width, height } = cropData;

                // Perluas area interaksi untuk memudahkan pengguna
                const interactionMargin = INTERACTION_AREA * 1.5;

                // Check touch position for edges/corners
                const isLeftEdge = Math.abs(locationX - originX) < interactionMargin;
                const isRightEdge = Math.abs(locationX - (originX + width)) < interactionMargin;
                const isTopEdge = Math.abs(locationY - originY) < interactionMargin;
                const isBottomEdge = Math.abs(locationY - (originY + height)) < interactionMargin;

                if (isLeftEdge && isTopEdge) setInteractionType('top-left');
                else if (isRightEdge && isTopEdge) setInteractionType('top-right');
                else if (isLeftEdge && isBottomEdge) setInteractionType('bottom-left');
                else if (isRightEdge && isBottomEdge) setInteractionType('bottom-right');
                else if (isLeftEdge) setInteractionType('left');
                else if (isRightEdge) setInteractionType('right');
                else if (isTopEdge) setInteractionType('top');
                else if (isBottomEdge) setInteractionType('bottom');
                else if (locationX > originX && locationX < originX + width &&
                    locationY > originY && locationY < originY + height) {
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

                // Batasi pergerakan dalam batas gambar
                const maxX = displayDimensions.width;
                const maxY = displayDimensions.height;

                switch (interactionType) {
                    case 'move':
                        newCropData.originX = Math.max(0, Math.min(maxX - width, originX + dx));
                        newCropData.originY = Math.max(0, Math.min(maxY - height, originY + dy));
                        break;
                    case 'left':
                        newCropData.originX = Math.max(0, Math.min(originX + width - MIN_CROP_SIZE, originX + dx));
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(originX + width, width - dx));
                        break;
                    case 'right':
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(maxX - originX, width + dx));
                        break;
                    case 'top':
                        newCropData.originY = Math.max(0, Math.min(originY + height - MIN_CROP_SIZE, originY + dy));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(originY + height, height - dy));
                        break;
                    case 'bottom':
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(maxY - originY, height + dy));
                        break;
                    case 'top-left':
                        newCropData.originX = Math.max(0, Math.min(originX + width - MIN_CROP_SIZE, originX + dx));
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(originX + width, width - dx));
                        newCropData.originY = Math.max(0, Math.min(originY + height - MIN_CROP_SIZE, originY + dy));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(originY + height, height - dy));
                        break;
                    case 'top-right':
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(maxX - originX, width + dx));
                        newCropData.originY = Math.max(0, Math.min(originY + height - MIN_CROP_SIZE, originY + dy));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(originY + height, height - dy));
                        break;
                    case 'bottom-left':
                        newCropData.originX = Math.max(0, Math.min(originX + width - MIN_CROP_SIZE, originX + dx));
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(originX + width, width - dx));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(maxY - originY, height + dy));
                        break;
                    case 'bottom-right':
                        newCropData.width = Math.max(MIN_CROP_SIZE, Math.min(maxX - originX, width + dx));
                        newCropData.height = Math.max(MIN_CROP_SIZE, Math.min(maxY - originY, height + dy));
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
        if (visible && imageUri) {
            setCurrentImage(imageUri);
            setOriginalImage(imageUri);
            loadImageDimensions(imageUri);
        } else {
            resetEditor();
        }
    }, [visible, imageUri]);

    const loadImageDimensions = (uri) => {
        Image.getSize(uri, (width, height) => {
            const displayHeight = (SCREEN_WIDTH * height) / width;
            setImageDimensions({ width, height });
            setDisplayDimensions({ width: SCREEN_WIDTH, height: displayHeight });
            setScaleFactor({ x: width / SCREEN_WIDTH, y: height / displayHeight });

            // Set initial crop area (80% of image centered)
            const initialWidth = Math.min(SCREEN_WIDTH * 0.8, SCREEN_WIDTH);
            const initialHeight = Math.min(displayHeight * 0.8, displayHeight);

            setCropData({
                originX: (SCREEN_WIDTH - initialWidth) / 2,
                originY: (displayHeight - initialHeight) / 2,
                width: initialWidth,
                height: initialHeight
            });
        }, (error) => {
            console.error('Error getting image size:', error);
            handleError('Failed to load image', error);
        });
    };

    const resetEditor = () => {
        setCurrentImage(originalImage || imageUri);
        setActiveTool(null);
        if (originalImage || imageUri) {
            loadImageDimensions(originalImage || imageUri);
        }
    };

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
            loadImageDimensions(rotatedImage.uri);
        } catch (error) {
            console.error('Rotation error:', error);
            handleError('Failed to rotate image', error);
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
            loadImageDimensions(croppedImage.uri);
        } catch (error) {
            console.error('Cropping error:', error);
            handleError('Failed to crop image', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!currentImage) {
            Alert.alert("Error", "No image to save");
            return;
        }
        setIsProcessing(true);
        try {
            const compressedUri = await ImageManipulator.manipulateAsync(
                currentImage,
                [],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            onSave(compressedUri.uri);
            onClose();
        } catch (error) {
            console.error('Saving error:', error);
            handleError('Failed to save image', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleError = (message, error) => {
        if (onError) {
            onError(error || new Error(message));
        } else {
            Alert.alert("Error", message);
        }
    };

    const renderCropOverlay = () => {
        const { originX, originY, width, height } = cropData;

        return (
            <View
                style={[styles.cropOverlay, {
                    width: displayDimensions.width,
                    height: displayDimensions.height,
                }]}
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
                    <Text style={styles.toolTitle}>Processing...</Text>
                </View>
            );
        }

        switch (activeTool) {
            case 'rotate':
                return (
                    <View style={styles.toolContainer}>
                        <Text style={styles.toolTitle}>Putar Gambar</Text>
                        <View style={styles.transformActions}>
                            {ROTATE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.degrees}
                                    style={styles.transformButton}
                                    onPress={() => handleRotate(option.degrees)}
                                >
                                    <Feather name={option.icon} size={24} color="#4A90E2" />
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
                                <Text style={styles.primaryButtonText}>Terapkan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'crop':
                return (
                    <View style={styles.toolContainer}>
                        <Text style={styles.toolTitle}>Potong Gambar</Text>
                        <Text style={styles.instructionText}>
                            Seret tepi untuk mengubah ukuran atau seret tengah untuk memindahkan area potong
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
                                <Text style={styles.primaryButtonText}>Terapkan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'reset':
                return (
                    <View style={styles.toolContainer}>
                        <Text style={styles.toolTitle}>Reset Gambar</Text>
                        <Text style={styles.instructionText}>
                            Ini akan membatalkan semua perubahan
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
                                onPress={resetEditor}
                            >
                                <Text style={styles.primaryButtonText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    if (!currentImage) {
        return (
            <Modal visible={visible} onRequestClose={onClose} transparent>
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.emptyText}>Loading Gambar...</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
                        <Text style={styles.primaryButtonText}>{closeButtonText}</Text>
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
            <SafeAreaView style={styles.safeArea}>
                <StatusBar
                    backgroundColor="#1E1E1E"
                    barStyle="light-content"
                    translucent={true}
                />
                <GestureHandlerRootView style={styles.container}>
                    <View style={styles.headerContainer}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={onClose}
                            >
                                <Feather name="x" size={24} color="white" />
                                <Text style={styles.headerButtonText}>{closeButtonText}</Text>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Edit Gambar</Text>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={handleSave}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#4A90E2" />
                                ) : (
                                    <>
                                        <Feather name="check" size={24} color="#4A90E2" />
                                        <Text style={[styles.headerButtonText, styles.saveButtonText]}>{saveButtonText}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.scrollContentContainer}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: currentImage }}
                                style={{
                                    width: displayDimensions.width,
                                    height: displayDimensions.height,
                                    minWidth: SCREEN_WIDTH,
                                    minHeight: SCREEN_WIDTH * 0.75
                                }}
                                resizeMode="contain"
                            />
                            {activeTool === 'crop' && renderCropOverlay()}
                        </View>
                    </ScrollView>

                    {renderToolContent()}

                    {!activeTool && !isProcessing && (
                        <View style={styles.toolbar}>
                            {TOOLS.map((tool) => (
                                <TouchableOpacity
                                    key={tool.key}
                                    style={styles.toolButton}
                                    onPress={() => setActiveTool(tool.key)}
                                    disabled={tool.key === 'reset' && currentImage === originalImage}
                                >
                                    <View style={[
                                        styles.toolIconContainer,
                                        (tool.key === 'reset' && currentImage === originalImage) && styles.disabledTool
                                    ]}>
                                        <Feather
                                            name={tool.icon}
                                            size={24}
                                            color={
                                                tool.key === 'reset' && currentImage === originalImage ?
                                                    '#666' : '#4A90E2'
                                            }
                                        />
                                    </View>
                                    <Text style={[
                                        styles.toolButtonText,
                                        (tool.key === 'reset' && currentImage === originalImage) && styles.disabledToolText
                                    ]}>
                                        {tool.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </GestureHandlerRootView>
            </SafeAreaView>
        </Modal>
    );
};
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#121212',
    },
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#1E1E1E',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 20,
    },
    emptyText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 20,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        minWidth: 80,
    },
    headerButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
    },
    saveButtonText: {
        color: '#4A90E2',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: -1,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },

    cropOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    cropArea: {
        position: 'absolute',
        borderWidth: CROP_BORDER_WIDTH,
        borderColor: 'white',
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
        borderLeftWidth: 3,
        borderTopWidth: 3,
    },
    cropCornerTR: {
        top: -CROP_BORDER_WIDTH,
        right: -CROP_BORDER_WIDTH,
        borderRightWidth: 3,
        borderTopWidth: 3,
    },
    cropCornerBL: {
        bottom: -CROP_BORDER_WIDTH,
        left: -CROP_BORDER_WIDTH,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
    },
    cropCornerBR: {
        bottom: -CROP_BORDER_WIDTH,
        right: -CROP_BORDER_WIDTH,
        borderRightWidth: 3,
        borderBottomWidth: 3,
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
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'android' ? 24 : 12,
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    toolButton: {
        alignItems: 'center',
        width: '30%',
    },
    toolIconContainer: {
        backgroundColor: '#252525',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    disabledTool: {
        opacity: 0.5,
    },
    toolButtonText: {
        color: 'white',
        fontSize: 14,
    },
    disabledToolText: {
        color: '#666',
    },
    toolContainer: {
        padding: 16,
        paddingBottom: Platform.OS === 'android' ? 24 : 16,
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    toolTitle: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
    instructionText: {
        color: '#AAA',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    transformActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    transformButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#252525',
        width: '45%',
    },
    transformButtonText: {
        color: 'white',
        marginTop: 8,
        fontSize: 14,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    primaryButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        marginLeft: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#252525',
        alignItems: 'center',
        marginRight: 8,
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ImageEditorModal;