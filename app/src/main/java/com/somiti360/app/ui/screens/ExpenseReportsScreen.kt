package com.somiti360.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.somiti360.app.MainViewModel
import com.somiti360.app.data.model.Expense
import com.somiti360.app.data.model.SamityLanguage
import com.somiti360.app.data.util.BanglaNumberConverter

@Composable
fun ExpenseReportsScreen(
    viewModel: MainViewModel
) {
    val language by viewModel.language.collectAsState()
    val isBn = language == SamityLanguage.BN
    val expenses by viewModel.expenses.collectAsState()
    val metrics = viewModel.getMetrics()

    var subTab by remember { mutableStateOf(0) } // 0: Expenses, 1: Financial Ledger, 2: 28 Modules

    val categories = listOf(
        "ALL" to (if (isBn) "সকল খাত" else "All"),
        "Office Rent" to (if (isBn) "অফিস ভাড়া" else "Rent"),
        "Salaries" to (if (isBn) "সম্মানী ও বেতন" else "Salary"),
        "Events" to (if (isBn) "সভা ও আপ্যায়ন" else "Events"),
        "Stationery" to (if (isBn) "স্টেশনারি ও প্রিন্ট" else "Stationery"),
        "Maintenance" to (if (isBn) "রক্ষণাবেক্ষণ" else "Maintenance")
    )
    var selectedCategory by remember { mutableStateOf("ALL") }

    val filteredExpenses = expenses.filter {
        selectedCategory == "ALL" || it.category == selectedCategory
    }

    Scaffold(
        floatingActionButton = {
            if (subTab == 0) {
                FloatingActionButton(
                    onClick = { viewModel.openAddExpenseDialog() },
                    containerColor = Color(0xFFF59E0B),
                    contentColor = Color.White,
                    modifier = Modifier.testTag("fab_add_expense")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Expense")
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .testTag("expense_reports_screen")
        ) {
            // Sub Tabs
            TabRow(
                selectedTabIndex = subTab,
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Tab(
                    selected = subTab == 0,
                    onClick = { subTab = 0 },
                    text = { Text(if (isBn) "ব্যয় ভাউচার" else "Expenses") }
                )
                Tab(
                    selected = subTab == 1,
                    onClick = { subTab = 1 },
                    text = { Text(if (isBn) "আয়-ব্যয় খতিয়ান" else "Ledger") }
                )
                Tab(
                    selected = subTab == 2,
                    onClick = { subTab = 2 },
                    text = { Text(if (isBn) "২৮টি মডিউল" else "28 Modules") }
                )
            }

            when (subTab) {
                0 -> {
                    // Expenses Tab
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Category Filters
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState())
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            categories.forEach { (catKey, catLabel) ->
                                FilterChip(
                                    selected = selectedCategory == catKey,
                                    onClick = { selectedCategory = catKey },
                                    label = { Text(catLabel, style = MaterialTheme.typography.labelSmall) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = Color(0xFFF59E0B),
                                        selectedLabelColor = Color.White
                                    )
                                )
                            }
                        }

                        // Total Expense Header
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (isBn) "মোট খরচ: ${BanglaNumberConverter.formatCurrency(metrics.totalExpenses, true)}"
                                else "Total Expenses: ${BanglaNumberConverter.formatCurrency(metrics.totalExpenses, false)}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFDC2626)
                            )
                        }

                        // Expenses list
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            if (filteredExpenses.isEmpty()) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(36.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = if (isBn) "কোনো ব্যয়ের এন্ট্রি নেই" else "No expense records",
                                            style = MaterialTheme.typography.bodyLarge,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            } else {
                                items(filteredExpenses, key = { it.id }) { exp ->
                                    ExpenseItemCard(
                                        expense = exp,
                                        isBn = isBn,
                                        onDelete = { viewModel.deleteExpense(exp.id) }
                                    )
                                }
                            }
                        }
                    }
                }

                1 -> {
                    // Financial Ledger Summary
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            LedgerCard(
                                title = if (isBn) "মোট জমা (Total Inflow / Deposits)" else "Total Collections",
                                amount = metrics.totalCollections,
                                isPositive = true,
                                isBn = isBn,
                                subtitle = if (isBn) "সকল সদস্যের সম্মিলিত চাঁদা ও অনুদান" else "All member subscriptions"
                            )
                        }

                        item {
                            LedgerCard(
                                title = if (isBn) "মোট ব্যয় (Total Outflow / Expenses)" else "Total Operating Expenses",
                                amount = metrics.totalExpenses,
                                isPositive = false,
                                isBn = isBn,
                                subtitle = if (isBn) "অফিস ভাড়া, বেতন, স্টেশনারি ও আপ্যায়ন" else "Rent, honorarium, stationery & utilities"
                            )
                        }

                        item {
                            LedgerCard(
                                title = if (isBn) "চলতি নেট রিজার্ভ ফান্ড (Net Reserve Balance)" else "Net Reserve Fund Balance",
                                amount = metrics.netReserveFund,
                                isPositive = metrics.netReserveFund >= 0,
                                isBn = isBn,
                                subtitle = if (isBn) "সমিতির ব্যাংক ও ক্যাশে অবশিষ্ট ক্যাপিটাল" else "Remaining bank & cash capital reserve"
                            )
                        }

                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                                )
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = if (isBn) "অডিট ও সিকিউরিটি সনদ" else "Audit & Security Certification",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = if (isBn) "সমিতি ৩৬০ ডিজিটাল সিস্টেম বাংলাদেশ সরকার অনুমোদিত সমবায় নীতিমালা ও ডাবল-এন্ট্রি বুককিপিং মানদণ্ডে পরিচালিত। প্রতিটি জমা এবং খরচের ভাউচার অপরিবর্তনীয় অডিট ট্রেইলে সংরক্ষিত থাকে।"
                                        else "Somiti 360 is maintained under cooperative accounting guidelines with verifiable audit trail and double-entry bookkeeping safeguards.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        item {
                            val ctx = androidx.compose.ui.platform.LocalContext.current
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFF0FDF4)
                                )
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = if (isBn) "☁️ গুগল ড্রাইভ ও ক্লাউড ব্যাকআপ" else "☁️ Google Drive & Cloud Backup",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF047857)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = if (isBn) "১-ক্লিকে সকল সদস্য, জমা এবং খরচের ডাটাবেজ ব্যাকআপ নিয়ে সরাসরি আপনার Google Drive-এ সংরক্ষণ করুন।"
                                        else "Backup complete members, deposits, and expenses database directly to your Google Drive in one click.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontSize = 12.sp,
                                        color = Color(0xFF065F46)
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Button(
                                        onClick = { viewModel.exportToGoogleDrive(ctx) },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF047857))
                                    ) {
                                        Text(if (isBn) "Google Drive-এ সরাসরি ব্যাকআপ নিন" else "Backup to Google Drive")
                                    }
                                }
                            }
                        }
                    }
                }

                2 -> {
                    // 28 Modules Overview
                    val modulesList = listOf(
                        "১. সমিতি ও শাখা সেটআপ", "২. পূর্ণাঙ্গ সদস্য ব্যবস্থাপনা", "৩. সাবস্ক্রিপশন ও চাঁদা পলিসি",
                        "৪. ব্যাংক ও নগদ জমা", "৫. বাল্ক ব্যাংক ডিপোজিট", "৬. লাইভ পেমেন্ট স্ট্যাটাস",
                        "৭. বকেয়া ও মওকুফ", "৮. কিউআর কোড ভেরিফায়েড রসিদ", "৯. সেন্ট্রাল রিমাইন্ডার ইঞ্জিন",
                        "১০. হোয়াটসঅ্যাপ রিমাইন্ডার", "১১. এসএমএস নোটিফিকেশন", "১২. টেলিগ্রাম অ্যালার্ট",
                        "১৩. মেসেঞ্জার শেয়ারিং", "১৪. খরচ ও ভাউচার ম্যানেজমেন্ট", "১৫. ফান্ড ও ব্যাংক ব্যালেন্স",
                        "১৬. ২৮টি অটোমেটেড রিপোর্ট", "১৭. লেটারহেড ও প্রিন্টিং প্যাড", "১৮. ডিজিটাল স্বাক্ষর ও সিল",
                        "১৯. প্রত্যয়ন ও সনদপত্র", "২০. আরবিএসি ইউজার পারমিশন", "২১. ১-ক্লিক অনুমোদন ওয়ার্কফ্লো",
                        "২২. অপরিবর্তনীয় অডিট ট্রেইল", "২৩. নোটিফিকেশন সেন্টার", "২৪. এক্সিকিউটিভ ড্যাশবোর্ড",
                        "২৫. সিস্টেম কনফিগারেশন", "২৬. রেস্ট এপিআই ও ওয়েবহুক", "২৭. বাংলা ও ইংরেজি ইন্টারফেস",
                        "২৮. ব্যাকআপ, এক্সপোর্ট ও ক্লাউড সিঙ্ক"
                    )

                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(modulesList) { item ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(CircleShape)
                                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = "✓",
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = item,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ExpenseItemCard(
    expense: Expense,
    isBn: Boolean,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("expense_item_${expense.voucherNo}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF59E0B).copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Wallet,
                    contentDescription = null,
                    tint = Color(0xFFF59E0B),
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = expense.title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${expense.voucherNo} • ${expense.category} • ${expense.paymentMethod}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (expense.payeeName.isNotBlank()) {
                    Text(
                        text = "প্রাপক: ${expense.payeeName}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "-" + BanglaNumberConverter.formatCurrency(expense.amount, isBn),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFFDC2626)
                )
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = MaterialTheme.colorScheme.error.copy(alpha = 0.6f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun LedgerCard(
    title: String,
    amount: Double,
    isPositive: Boolean,
    isBn: Boolean,
    subtitle: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = (if (isPositive) "+" else "-") + BanglaNumberConverter.formatCurrency(amount, isBn),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.ExtraBold,
                color = if (isPositive) Color(0xFF10B981) else Color(0xFFDC2626)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
