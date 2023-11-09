// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';

import {fetchChannelMemberships, getGroupMessageMembersCommonTeams} from '@actions/remote/channel';
import {PER_PAGE_DEFAULT} from '@app/client/rest/constants';
import {useServerUrl} from '@app/context/server';

import ConvertGMToChannelForm from './convert_gm_to_channel_form';
import {Loader} from './loader';

type Props = {
    channelId: string;
    currentUserId?: string;
}

const loadingIndicatorTimeout = 1200;

const ConvertGMToChannel = ({
    channelId,
    currentUserId,
}: Props) => {
    const [loadingAnimationTimeout, setLoadingAnimationTimeout] = useState(false);
    const [commonTeamsFetched, setCommonTeamsFetched] = useState(false);
    const [channelMembersFetched, setChannelMembersFetched] = useState(false);
    const [commonTeams, setCommonTeams] = useState<Team[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);

    const serverUrl = useServerUrl();
    const mounted = useRef(false);

    useEffect(() => {
        setTimeout(() => setLoadingAnimationTimeout(true), loadingIndicatorTimeout);
        async function work() {
            const {teams} = await getGroupMessageMembersCommonTeams(serverUrl, channelId);
            if (!teams) {
                return;
            }

            setCommonTeams(teams);
            setCommonTeamsFetched(true);
        }

        work();
    }, []);

    useEffect(() => {
        mounted.current = true;

        const options: GetUsersOptions = {sort: 'admin', active: true, per_page: PER_PAGE_DEFAULT};
        fetchChannelMemberships(serverUrl, channelId, options, true).then(({users, members}) => {
            if (!mounted.current) {
                return;
            }

            if (users.length) {
                // Gotta make sure we use profiles that are in members.
                // See comment in fetchChannelMemberships for more details.

                const usersById: {[id: string]: UserProfile} = {};
                // eslint-disable-next-line max-nested-callbacks
                users.forEach((profile) => {
                    if (profile.id !== currentUserId) {
                        usersById[profile.id] = profile;
                    }
                });

                // eslint-disable-next-line max-nested-callbacks
                const filteredUsers: UserProfile[] = [];
                // eslint-disable-next-line max-nested-callbacks
                members.forEach((member) => {
                    if (usersById[member.user_id]) {
                        filteredUsers.push(usersById[member.user_id]);
                    }
                });
                setProfiles(filteredUsers);
            }

            setChannelMembersFetched(true);
        });

        return () => {
            mounted.current = false;
        };
    }, []);

    const showLoader = !loadingAnimationTimeout || !commonTeamsFetched || !channelMembersFetched;
    if (showLoader) {
        return (<Loader/>);
    }

    return (
        <ConvertGMToChannelForm
            commonTeams={commonTeams}
            profiles={profiles}
            channelId={channelId}
        />
    );
};

export default ConvertGMToChannel;
