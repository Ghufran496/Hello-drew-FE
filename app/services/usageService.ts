import { db } from '@/db';
import { usageLimits } from '@/db/schema/usage_limits';
import { notifications } from '@/db/schema/notifications';

export async function checkUsageAndNotify() {
    console.log('📊 Starting usage check...');
    try {
        // Fetch all users' usage data
        const usageData = await db
            .select()
            .from(usageLimits)
            .execute();

        console.log(`📊 Found ${usageData.length} users to check...`);
        
        // Iterate through usage data to check limits
        for (const user of usageData) {
            console.log(`🔍 Checking user ${user.userId}:`, {
                calls: `${user.callsUsed}/${user.callsLimit}`,
                texts: `${user.textsUsed}/${user.textsLimit}`,
                emails: `${user.emailsUsed}/${user.emailsLimit}`
            });

            const { userId, callsLimit, callsUsed, textsLimit, textsUsed, emailsLimit, emailsUsed } = user;

            // Skip if userId is missing or any value is null/undefined (but allow 0)
            if (!userId || 
                callsLimit === null || callsUsed === null || 
                textsLimit === null || textsUsed === null || 
                emailsLimit === null || emailsUsed === null) {
                console.log(`⚠️ Skipping user ${userId} due to missing values`);
                continue;
            }

            const notificationsToInsert = [];

            // Convert values to numbers to ensure proper comparison
            const callsUsedNum = Number(callsUsed) || 0;
            const callsLimitNum = Number(callsLimit) || 0;
            const ratio = callsLimitNum > 0 ? callsUsedNum / callsLimitNum : 0;
            const percentage = ratio * 100;

            console.log('Processed values:', {
                callsUsed: callsUsedNum,
                callsLimit: callsLimitNum,
                ratio,
                percentage,
                isNearLimit: ratio >= 0.8 && ratio < 1,
                isOverLimit: callsUsedNum >= callsLimitNum
            });

            // Check calls usage with more precise conditions
            if (ratio >= 0.8 && ratio < 1) {
                console.log('🚨 Triggering near-limit notification');
                notificationsToInsert.push({
                    user_id: userId,
                    title: 'Call Usage Alert',
                    message: `You have used ${Math.floor(percentage)}% of your call limit (${callsUsedNum}/${callsLimitNum}).`,
                    type: 'usage',
                });
            } else if (callsUsedNum >= callsLimitNum) {
                console.log('🚨 Triggering over-limit notification');
                notificationsToInsert.push({
                    user_id: userId,
                    title: 'Call Usage Limit Exceeded',
                    message: `You have exceeded your call limit (${callsUsedNum}/${callsLimitNum}).`,
                    type: 'usage',
                });
            }

            // Check texts usage
            if (textsUsed / textsLimit >= 0.8 && textsUsed / textsLimit < 1) {
                console.log(`📝 User ${userId} at ${Math.floor((textsUsed / textsLimit) * 100)}% of text limit`);
                notificationsToInsert.push({
                    user_id: userId,
                    title: 'Text Usage Alert',
                    message: `You have used ${Math.floor((textsUsed / textsLimit) * 100)}% of your text limit.`,
                    type: 'usage',
                });
            } else if (textsUsed >= textsLimit) {
                notificationsToInsert.push({
                    user_id: userId,
                    title: 'Text Usage Limit Exceeded',
                    message: `You have exceeded your text limit.`,
                    type: 'usage',
                });
            }

            // Check emails usage
            if (emailsUsed / emailsLimit >= 0.8 && emailsUsed / emailsLimit < 1) {
                console.log(`📧 User ${userId} at ${Math.floor((emailsUsed / emailsLimit) * 100)}% of email limit`);
                notificationsToInsert.push({
                    user_id: userId,
                    title: 'Email Usage Alert',
                    message: `You have used ${Math.floor((emailsUsed / emailsLimit) * 100)}% of your email limit.`,
                    type: 'usage',
                });
            } else if (emailsUsed >= emailsLimit) {
                notificationsToInsert.push({
                    user_id: userId,
                    title: 'Email Usage Limit Exceeded',
                    message: `You have exceeded your email limit.`,
                    type: 'usage',
                });
            }

            // Insert notifications into the database
            if (notificationsToInsert.length > 0) {
                console.log(`📫 Creating ${notificationsToInsert.length} notifications for user ${userId}`);
                await db.insert(notifications).values(notificationsToInsert);
            } else {
                console.log(`ℹ️ No notifications needed for user ${userId}`);
            }
        }

        console.log('✅ Usage check completed successfully');
    } catch (error) {
        console.error('❌ Error in usage check:', error);
    }
}