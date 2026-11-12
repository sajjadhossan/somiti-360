package com.somiti360.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.HourglassBottom
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.credentials.CredentialManager
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth
import com.somiti360.app.data.model.SamityLanguage
import com.somiti360.app.ui.auth.AuthScreen
import com.somiti360.app.ui.auth.GoogleAuthHelper
import com.somiti360.app.ui.screens.AddDepositDialog
import com.somiti360.app.ui.screens.AddExpenseDialog
import com.somiti360.app.ui.screens.AddMemberDialog
import com.somiti360.app.ui.screens.CollectionScreen
import com.somiti360.app.ui.screens.DashboardScreen
import com.somiti360.app.ui.screens.DuesScreen
import com.somiti360.app.ui.screens.ExpenseReportsScreen
import com.somiti360.app.ui.screens.MembersScreen
import com.somiti360.app.ui.screens.MemberDetailDialog
import com.somiti360.app.ui.screens.OfficialReceiptDialog
import com.somiti360.app.ui.screens.ReceiptVerificationDialog
import com.somiti360.app.ui.screens.SamitySettingsDialog
import com.somiti360.app.ui.theme.Somiti360Theme

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isDark by viewModel.isDarkMode.collectAsState()
            Somiti360Theme(darkTheme = isDark) {
                MainAppHost(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppHost(viewModel: MainViewModel) {
    var currentUser by remember { mutableStateOf(Firebase.auth.currentUser) }
    var continueOffline by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        val listener = FirebaseAuth.AuthStateListener { auth ->
            currentUser = auth.currentUser
            if (auth.currentUser != null) {
                viewModel.startRealtimeSync()
            }
        }
        Firebase.auth.addAuthStateListener(listener)
        onDispose {
            Firebase.auth.removeAuthStateListener(listener)
        }
    }

    if (currentUser == null && !continueOffline) {
        AuthScreen(
            onAuthSuccess = {
                currentUser = Firebase.auth.currentUser
                viewModel.startRealtimeSync()
            },
            onSkipOffline = {
                continueOffline = true
            }
        )
    } else {
        Somiti360App(
            viewModel = viewModel,
            currentUserEmail = currentUser?.email,
            onSignOut = {
                continueOffline = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Somiti360App(
    viewModel: MainViewModel,
    currentUserEmail: String?,
    onSignOut: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val credentialManager = remember { CredentialManager.create(context) }

    val selectedTab by viewModel.selectedTab.collectAsState()
    val language by viewModel.language.collectAsState()
    val isBn = language == SamityLanguage.BN
    val isDark by viewModel.isDarkMode.collectAsState()
    val profile by viewModel.profile.collectAsState()
    val isCloudConnected by viewModel.isCloudConnected.collectAsState()

    var showAccountMenu by remember { mutableStateOf(false) }

    // Modals & Dialogs states
    val showAddMember by viewModel.showAddMemberDialog.collectAsState()
    val selectedMemberForDetail by viewModel.selectedMemberForDetail.collectAsState()
    val showAddDeposit by viewModel.showAddDepositDialog.collectAsState()
    val preselectedMemberForDeposit by viewModel.preselectedMemberForDeposit.collectAsState()
    val showAddExpense by viewModel.showAddExpenseDialog.collectAsState()
    val selectedDepositForReceipt by viewModel.selectedDepositForReceipt.collectAsState()
    val showQrVerification by viewModel.showQrVerificationDialog.collectAsState()
    val showSettings by viewModel.showSettingsDialog.collectAsState()

    // Back handler
    BackHandler(enabled = selectedTab != 0 || showAddMember || showAddDeposit || showAddExpense || showQrVerification || showSettings || selectedMemberForDetail != null || selectedDepositForReceipt != null) {
        when {
            selectedDepositForReceipt != null -> viewModel.closeReceiptModal()
            selectedMemberForDetail != null -> viewModel.closeMemberDetail()
            showAddMember -> viewModel.closeAddMemberDialog()
            showAddDeposit -> viewModel.closeAddDepositDialog()
            showAddExpense -> viewModel.closeAddExpenseDialog()
            showQrVerification -> viewModel.closeQrVerificationDialog()
            showSettings -> viewModel.closeSettingsDialog()
            selectedTab != 0 -> viewModel.selectTab(0)
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(1.dp, MaterialTheme.colorScheme.primary, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_somiti_emblem),
                                contentDescription = "Somiti Logo",
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (isBn) "সমিতি ৩৬০" else "Somiti 360",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                // Real-time Cloud Indicator Badge
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (isCloudConnected) Color(0xFF10B981).copy(alpha = 0.2f) else Color(0xFFF59E0B).copy(alpha = 0.2f)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = if (isCloudConnected) Icons.Default.CloudDone else Icons.Default.Sync,
                                            contentDescription = null,
                                            tint = if (isCloudConnected) Color(0xFF10B981) else Color(0xFFF59E0B),
                                            modifier = Modifier.size(10.dp)
                                        )
                                        Spacer(modifier = Modifier.width(2.dp))
                                        Text(
                                            text = if (isCloudConnected) "সিঙ্কড ⚡" else "লোকাল",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isCloudConnected) Color(0xFF10B981) else Color(0xFFF59E0B)
                                        )
                                    }
                                }
                            }
                            Text(
                                text = if (isBn) "সমিতি ও সমবায় ক্লাউড ডাটাবেজ" else "Cooperative Real-time Cloud",
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                },
                actions = {
                    // Google Drive 1-Click Direct Backup
                    IconButton(
                        onClick = { viewModel.exportToGoogleDrive(context) },
                        modifier = Modifier.testTag("action_google_drive_backup")
                    ) {
                        Icon(
                            Icons.Default.CloudUpload,
                            contentDescription = "Backup to Google Drive",
                            tint = Color(0xFF0284C7)
                        )
                    }

                    // QR Verification icon button
                    IconButton(
                        onClick = { viewModel.openQrVerificationDialog() },
                        modifier = Modifier.testTag("action_qr_verify")
                    ) {
                        Icon(
                            Icons.Default.QrCodeScanner,
                            contentDescription = "Verify Document",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Language Toggle
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { viewModel.toggleLanguage() }
                            .testTag("action_toggle_language"),
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = if (isBn) "EN" else "বাং",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Account / Sign-Out Menu
                    IconButton(
                        onClick = { showAccountMenu = true },
                        modifier = Modifier.testTag("action_account_menu")
                    ) {
                        Box(
                            modifier = Modifier
                                .size(30.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentUserEmail?.take(1)?.uppercase() ?: "G",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                modifier = Modifier.testTag("bottom_navigation_bar")
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { viewModel.selectTab(0) },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text(if (isBn) "ড্যাশবোর্ড" else "Dashboard", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_dashboard")
                )

                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { viewModel.selectTab(1) },
                    icon = { Icon(Icons.Default.Group, contentDescription = "Members") },
                    label = { Text(if (isBn) "সদস্যবৃন্দ" else "Members", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_members")
                )

                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { viewModel.selectTab(2) },
                    icon = { Icon(Icons.Default.Payments, contentDescription = "Collection") },
                    label = { Text(if (isBn) "জমা ও রসিদ" else "Deposit", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_collection")
                )

                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { viewModel.selectTab(3) },
                    icon = { Icon(Icons.Default.HourglassBottom, contentDescription = "Dues") },
                    label = { Text(if (isBn) "বকেয়া" else "Dues", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_dues")
                )

                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { viewModel.selectTab(4) },
                    icon = { Icon(Icons.Default.AccountBalanceWallet, contentDescription = "Expense & Reports") },
                    label = { Text(if (isBn) "ব্যয় ও খতিয়ান" else "Ledger", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_expenses")
                )
            }
        }
    ) { padding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            color = MaterialTheme.colorScheme.background
        ) {
            when (selectedTab) {
                0 -> DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToTab = { viewModel.selectTab(it) }
                )
                1 -> MembersScreen(viewModel = viewModel)
                2 -> CollectionScreen(viewModel = viewModel)
                3 -> DuesScreen(viewModel = viewModel)
                4 -> ExpenseReportsScreen(viewModel = viewModel)
            }
        }
    }

    // Account & Google Drive Dialog
    if (showAccountMenu) {
        AlertDialog(
            onDismissRequest = { showAccountMenu = false },
            title = {
                Text(if (isBn) "গুগল অ্যাকাউন্ট ও ক্লাউড ব্যাকআপ" else "Google Account & Cloud Backup")
            },
            text = {
                Column {
                    Text(
                        text = "লগইনকৃত ইমেইল: ${currentUserEmail ?: "অফলাইন মোড"}",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "ফায়ারস্টোর লাইভ সিঙ্ক সক্রিয় রয়েছে। অন্য কোনো অ্যাপ বা ওয়েব পেজে কোনো ট্রানজ্যাকশন এন্ট্রি করা হলে এই ডিভাইসে সরাসরি আপডেট হবে।",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = {
                            showAccountMenu = false
                            viewModel.exportToGoogleDrive(context)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7))
                    ) {
                        Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Google Drive-এ সরাসরি ব্যাকআপ নিন")
                    }
                }
            },
            confirmButton = {
                if (currentUserEmail != null) {
                    TextButton(
                        onClick = {
                            showAccountMenu = false
                            GoogleAuthHelper.signOut(
                                credentialManager = credentialManager,
                                scope = scope,
                                onComplete = onSignOut
                            )
                        }
                    ) {
                        Icon(Icons.Default.Logout, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("সাইন আউট", color = MaterialTheme.colorScheme.error)
                    }
                } else {
                    TextButton(onClick = { showAccountMenu = false }) {
                        Text("বন্ধ করুন")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showAccountMenu = false
                    viewModel.openSettingsDialog()
                }) {
                    Text("সমিতি সেটিংস")
                }
            }
        )
    }

    // Other dialogs
    if (showAddMember) {
        AddMemberDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.closeAddMemberDialog() }
        )
    }

    selectedMemberForDetail?.let { member ->
        MemberDetailDialog(
            member = member,
            viewModel = viewModel,
            onDismiss = { viewModel.closeMemberDetail() }
        )
    }

    if (showAddDeposit) {
        AddDepositDialog(
            viewModel = viewModel,
            preselectedMember = preselectedMemberForDeposit,
            onDismiss = { viewModel.closeAddDepositDialog() }
        )
    }

    if (showAddExpense) {
        AddExpenseDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.closeAddExpenseDialog() }
        )
    }

    selectedDepositForReceipt?.let { dep ->
        OfficialReceiptDialog(
            deposit = dep,
            viewModel = viewModel,
            onDismiss = { viewModel.closeReceiptModal() }
        )
    }

    if (showQrVerification) {
        ReceiptVerificationDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.closeQrVerificationDialog() }
        )
    }

    if (showSettings) {
        SamitySettingsDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.closeSettingsDialog() }
        )
    }
}
