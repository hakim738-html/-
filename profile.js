document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const personId = urlParams.get('id');
    
    const persons = JSON.parse(localStorage.getItem('persons')) || [];
    const person = persons.find(p => p.id === personId);
    
    const profileData = document.getElementById('profileData');
    const profileName = document.getElementById('profileName');
    const profileStatus = document.getElementById('profileStatus');
    
    if (person) {
        // التحقق من انتهاء الصلاحية
        const isExpired = new Date() > new Date(person.expiresAt);
        
        if (isExpired) {
            profileData.innerHTML = `
                <div class="alert alert-danger expired-alert m-4 text-center">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>⚠️ انتهت صلاحية هذه البيانات</h4>
                    <p>لم يعد من الممكن عرض هذه المعلومات لأنها تجاوزت مدة الصلاحية البالغة 5 أشهر</p>
                    <p class="text-muted">تم الإنشاء في: ${new Date(person.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
            `;
            profileStatus.textContent = 'انتهت الصلاحية';
            return;
        }
        
        profileName.textContent = person.name;
        profileStatus.textContent = 'بيانات سارية المفعول';
        
        const infoItems = [
            { icon: 'user', label: 'الاسم الكامل', value: person.name },
            { icon: 'calendar', label: 'العمر', value: `${person.age} سنة` },
            { icon: 'birthday-cake', label: 'تاريخ الميلاد', value: person.birthDate },
            { icon: 'map-marker-alt', label: 'مكان الإقامة', value: person.location },
            { icon: 'globe', label: 'الجنسية', value: person.nationality || 'غير محدد' },
            { icon: 'id-card', label: 'رقم الهوية', value: person.idNumber || 'غير محدد' }
        ];
        
        let infoHTML = '';
        infoItems.forEach((item, index) => {
            infoHTML += `
                <div class="info-item fade-in-item" style="animation-delay: ${index * 0.1}s">
                    <i class="fas fa-${item.icon} me-2 text-primary"></i>
                    <strong>${item.label}:</strong> ${item.value}
                </div>
            `;
        });
        
        if (person.additionalInfo) {
            infoHTML += `
                <div class="info-item fade-in-item" style="animation-delay: ${infoItems.length * 0.1}s">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    <strong>معلومات إضافية:</strong><br>
                    <p class="mt-2">${person.additionalInfo}</p>
                </div>
            `;
        }
        
        infoHTML += `
            <div class="info-item text-center text-muted fade-in-item" style="animation-delay: ${(infoItems.length + 1) * 0.1}s">
                <small>
                    <i class="fas fa-calendar-plus me-1"></i>
                    تم الإنشاء في: ${new Date(person.createdAt).toLocaleDateString('ar-EG')}<br>
                    <i class="fas fa-calendar-times me-1"></i>
                    تنتهي الصلاحية في: ${new Date(person.expiresAt).toLocaleDateString('ar-EG')}
                </small>
            </div>
        `;
        
        profileData.innerHTML = infoHTML;
    } else {
        profileData.innerHTML = `
            <div class="alert alert-danger m-4 text-center animate__animated animate__shakeX">
                <i class="fas fa-times-circle fa-2x mb-3"></i>
                <h4>❌ خطأ</h4>
                <p>لم يتم العثور على البيانات المطلوبة</p>
                <p class="text-muted">قد تكون هذه البيانات قد انتهت صلاحيتها أو تم حذفها</p>
            </div>
        `;
        profileStatus.textContent = 'غير موجود';
    }
});