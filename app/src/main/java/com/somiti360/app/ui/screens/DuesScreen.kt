package com.somiti360.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassBottom
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.somiti360.app.MainViewModel
import com.somiti360.app.data.model.Member
import com.somiti360.app.data.model.SamityLanguage
import com.somiti360.app.data.model.getCurrentMonthName
import com.somiti360.app.data.util.BanglaNumberConverter

@Composable
fun DuesScreen(
    viewModel: MainViewModel
) {
    val context = LocalContext.current
    val language by viewModel.language.collectAsState()
    val isBn = language == SamityLanguage.BN
    val profile by viewModel.profile.collectAsState()
    val members by viewModel.members.collectAsState()
    val deposits by viewModel.deposits.collectAsState()

    val currentMonthName = getCurrentMonthName(true)
    val paidMemberIds = deposits
        .filter { it.status == "Approved" && (it.month.contains(currentMonthName) || it.date.startsWith("2026-11")) }
        .map { it.memberId }
        .toSet()

    val dueMembers = members.filter { it.status == "Active" && !paidMemberIds.contains(it.id) }
    val totalDueAmount = dueMembers.sumOf { it.monthlySubscriptionAmount }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("dues_screen")
    ) {
        // Summary Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (dueMembers.isNotEmpty()) Color(0xFFFEF2F2) else Color(0xFFF0FDF4)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(if (dueMembers.isNotEmpty()) Color(0xFFEF4444) else Color(0xFF10B981)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (dueMembers.isNotEmpty()) Icons.Default.Warning else Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isBn) "চলতি মাসের বকেয়া তালিকা" else "Current Month Due Status",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (dueMembers.isNotEmpty()) Color(0xFF991B1B) else Color(0xFF065F46)
                        )
                        Text(
                            text = if (isBn) "হিসাবের মাস: $currentMonthName" else "Billing Month: $currentMonthName",
                            style = MaterialTheme.typography.bodyMedium,
                            fontSize = 12.sp,
                            color = if (dueMembers.isNotEmpty()) Color(0xFFB91C1C) else Color(0xFF047857)
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = BanglaNumberConverter.formatCurrency(totalDueAmount, isBn),
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (dueMembers.isNotEmpty()) Color(0xFFDC2626) else Color(0xFF059669)
                        )
                        Text(
                            text = if (isBn) "${BanglaNumberConverter.toBanglaDigits(dueMembers.size)} জনের বকেয়া"
                            else "${dueMembers.size} Unpaid Members",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (dueMembers.isNotEmpty()) Color(0xFF991B1B) else Color(0xFF047857)
                        )
                    }
                }
            }
        }

        // Defaulters List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (dueMembers.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(36.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = if (isBn) "অভিনন্দন! চলতি মাসের কোনো বকেয়া চাঁদা নেই।" else "Great! All active members have paid for this month.",
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            } else {
                items(dueMembers, key = { it.id }) { member ->
                    DueMemberCard(
                        member = member,
                        isBn = isBn,
                        samityName = if (isBn) profile.nameBn else profile.nameEn,
                        currentMonth = currentMonthName,
                        onCollectClick = { viewModel.openAddDepositDialog(member) },
                        onSendWhatsApp = {
                            val msg = if (isBn) {
                                "শ্রদ্ধেয় ${member.nameBn}, ${profile.nameBn}-এর চলতি $currentMonthName মাসের মাসিক চাঁদা ${BanglaNumberConverter.formatCurrency(member.monthlySubscriptionAmount, true)} পরিশোধের জন্য অনুরোধ জানাচ্ছি। ধন্যবাদ।"
                            } else {
                                "Dear ${member.nameEn}, friendly reminder to submit your monthly subscription ${BanglaNumberConverter.formatCurrency(member.monthlySubscriptionAmount, false)} for $currentMonthName. Thank you."
                            }
                            val clean = member.phone.replace("+", "").replace("-", "").replace(" ", "")
                            val formatted = if (clean.startsWith("0")) "88$clean" else clean
                            val uri = Uri.parse("https://wa.me/$formatted?text=" + Uri.encode(msg))
                            context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                        },
                        onSendSms = {
                            val msg = if (isBn) {
                                "${profile.nameBn}: শ্রদ্ধেয় ${member.nameBn}, $currentMonthName মাসের চাঁদা ${BanglaNumberConverter.formatCurrency(member.monthlySubscriptionAmount, true)} পরিশোধ করুন।"
                            } else {
                                "${profile.nameEn}: Dear ${member.nameEn}, please clear monthly due ${member.monthlySubscriptionAmount}."
                            }
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("sms:${member.phone}?body=" + Uri.encode(msg)))
                            context.startActivity(intent)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun DueMemberCard(
    member: Member,
    isBn: Boolean,
    samityName: String,
    currentMonth: String,
    onCollectClick: () -> Unit,
    onSendWhatsApp: () -> Unit,
    onSendSms: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("due_member_${member.memberCode}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEF4444).copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.HourglassBottom,
                        contentDescription = null,
                        tint = Color(0xFFEF4444),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (isBn) member.nameBn else member.nameEn,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${member.memberCode} • ${member.designation} • ${member.phone}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = BanglaNumberConverter.formatCurrency(member.monthlySubscriptionAmount, isBn),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFFEF4444)
                    )
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFFEF4444).copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = if (isBn) "বকেয়া" else "Overdue",
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontSize = 10.sp,
                            color = Color(0xFFEF4444),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action dispatch bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onSendSms,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        Icons.Default.Message,
                        contentDescription = "SMS",
                        tint = Color(0xFF3B82F6),
                        modifier = Modifier.size(20.dp)
                    )
                }

                IconButton(
                    onClick = onSendWhatsApp,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        Icons.Default.Chat,
                        contentDescription = "WhatsApp",
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                Button(
                    onClick = onCollectClick,
                    modifier = Modifier.height(36.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(Icons.Default.Payments, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (isBn) "বকেয়া জমা নিন" else "Pay Now", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}
