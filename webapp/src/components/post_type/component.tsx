import React from 'react';
import moment from 'moment-timezone';
import styled from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';

import ActiveCallIcon from 'src/components/icons/active_call_icon';
import CallIcon from 'src/components/icons/call_icon';
import LeaveCallIcon from 'src/components/icons/leave_call_icon';
import ConnectedProfiles from 'src/components/connected_profiles';

interface Props {
    post: Post,
    connectedID: string,
    hasCall: boolean,
    pictures: string[],
    profiles: UserProfile[],
    showSwitchCallModal: (targetID: string) => void,
}

const PostType = ({post, connectedID, hasCall, pictures, profiles, showSwitchCallModal}: Props) => {
    const onJoinCallClick = () => {
        if (connectedID) {
            showSwitchCallModal(post.channel_id);
            return;
        }
        window.postMessage({type: 'connectCall', channelID: post.channel_id}, window.origin);
    };

    const onLeaveButtonClick = () => {
        if (window.callsClient) {
            window.callsClient.disconnect();
        }
    };

    const subMessage = post.props.end_at ? (
        <>
            <Duration>
                {`Ended at ${moment(post.props.end_at).format('h:mm A')}`}
            </Duration>
            <span style={{margin: '0 4px'}}>{'•'}</span>
            <Duration>
                {`Lasted ${moment.duration(post.props.end_at - post.props.start_at).humanize(false)}`}
            </Duration>
        </>
    ) : (
        <Duration>{moment(post.props.start_at).fromNow()}</Duration>
    );

    return (
        <>
            {post.props.title &&
                <h3 className='markdown__heading'>{post.props.title}</h3>
            }
            <Main data-testid={'call-thread'}>
                <SubMain ended={Boolean(post.props.end_at)}>
                    <Left>
                        <CallIndicator ended={Boolean(post.props.end_at)}>
                            {!post.props.end_at &&
                                <ActiveCallIcon
                                    fill='var(--center-channel-bg)'
                                    style={{width: '100%', height: '100%'}}
                                />
                            }
                            {post.props.end_at &&
                                <LeaveCallIcon
                                    fill={'rgba(var(--center-channel-color-rgb), 0.56)'}
                                    style={{width: '100%', height: '100%'}}
                                />
                            }
                        </CallIndicator>
                        <MessageWrapper>
                            <Message>{post.message}</Message>
                            <SubMessage>{subMessage}</SubMessage>
                        </MessageWrapper>
                    </Left>
                    <Right>
                        {
                            !post.props.end_at &&
                            <Profiles>
                                <ConnectedProfiles
                                    profiles={profiles}
                                    pictures={pictures}
                                    size={32}
                                    fontSize={12}
                                    border={true}
                                    maxShowedProfiles={2}
                                />
                            </Profiles>
                        }
                        {
                            !post.props.end_at && (!connectedID || connectedID !== post.channel_id) &&
                            <JoinButton onClick={onJoinCallClick}>
                                <CallIcon fill='var(--center-channel-bg)'/>
                                <ButtonText>{'Join call'}</ButtonText>
                            </JoinButton>
                        }
                        {
                            !post.props.end_at && connectedID && connectedID === post.channel_id &&
                            <LeaveButton onClick={onLeaveButtonClick}>
                                <LeaveCallIcon fill='var(--error-text)'/>
                                <ButtonText>{'Leave call'}</ButtonText>
                            </LeaveButton>
                        }
                    </Right>
                </SubMain>
            </Main>
        </>
    );
};

const Main = styled.div`
    display: flex;
    align-items: center;
    width: min(600px, 100%);
    margin: 4px 0;
    padding: 16px;
    background: var(--center-channel-bg);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    box-shadow: 0px 4px 6px rgba(var(--center-channel-color-rgb), 0.12);
    color: var(--center-channel-color);
    border-radius: 4px;
`;

const SubMain = styled.div<{ ended: Boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    flex-wrap: ${props => props.ended ? 'nowrap' : 'wrap'};
    row-gap: 8px;
`;

const Left = styled.div`
    display: flex;
    flex-grow: 10;
    overflow: hidden;
    white-space: nowrap;
`;

const Right = styled.div`
    display: flex;
    flex-grow: 1;
`;

const CallIndicator = styled.div<{ ended: Boolean }>`
    background: ${props => props.ended ? 'rgba(var(--center-channel-color-rgb), 0.16)' : 'var(--online-indicator)'};
    border-radius: 4px;
    padding: 10px;
    width: 40px;
    height: 40px;
`;

const MessageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 12px;
    overflow: hidden;
`;

const Message = styled.span`
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SubMessage = styled.div`
    white-space: normal;
`;

const Profiles = styled.div`
    display: flex;
    align-items: center;
    margin-right: auto;
`;

const Duration = styled.span`
    color: var(--center-channel-color);
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    cursor: pointer;
`;

const JoinButton = styled(Button)`
    color: var(--center-channel-bg);
    background: var(--online-indicator);
`;

const LeaveButton = styled(Button)`
    color: var(--error-text);
    background: rgba(var(--error-text-color-rgb), 0.16);
`;

const ButtonText = styled.span`
    font-weight: 600;
    margin: 0 8px;
`;

export default PostType;
