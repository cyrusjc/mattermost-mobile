// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';

import {observeCurrentUserId} from '@app/queries/servers/system';
import {observeTeammateNameDisplay} from '@app/queries/servers/user';

import ConvertGMToChannel from './convert_gm_to_channel';

import type {WithDatabaseArgs} from '@typings/database/database';

const enhance = withObservables([], ({database}: WithDatabaseArgs) => {
    const currentUserId = observeCurrentUserId(database);
    const teammateNameDisplay = observeTeammateNameDisplay(database);

    return {
        currentUserId,
        teammateNameDisplay,
    };
});

export default withDatabase(enhance(ConvertGMToChannel));
