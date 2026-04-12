import { Composition } from 'remotion';
import { LyricVideo } from './compositions/LyricVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="LyricVideo"
                component={LyricVideo}
                durationInFrames={1800} // 1 minute @ 30fps, will be dynamic
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    audioUrl: '',
                    timeline: { segments: [] },
                    template: {
                        id: 'default',
                        colors: {
                            text: '#ffffff',
                            background: '#000000',
                            highlight: '#ff0000'
                        },
                        fontSize: 60,
                        fontFamily: 'Inter'
                    }
                }}
            />
        </>
    );
};
